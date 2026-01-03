// app/dashboard/teacher/class/[id]/module-list.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus } from 'lucide-react'
import { createModuleAction, reorderModulesAction, deleteModuleAction } from '@/app/actions/course'
import ModuleItemManager from './module-item-manager'

function SortableItem({ 
  id, 
  title, 
  items, 
  classroomId, 
  onDelete 
}: { 
  id: string, 
  title: string, 
  items: any[], 
  classroomId: string,
  onDelete: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        // 1. PINDAHKAN ONCLICK KE SINI (Area Utama)
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-slate-200 rounded-lg p-4 mb-3 shadow-sm group hover:border-indigo-400 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 2. Stop Propagation di tombol drag agar tidak toggle saat mau drag */}
          <button 
            {...attributes} 
            {...listeners} 
            onClick={(e) => e.stopPropagation()} 
            className="cursor-move text-slate-400 hover:text-indigo-600 touch-none p-1"
          >
            <GripVertical size={20} />
          </button>
          
          <span className="font-medium text-slate-700">
             {title}
          </span>
        </div>
        
        <div className="flex gap-2 items-center">
           <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
             {items.length} Materi
           </span>
           {/* 3. Stop Propagation di tombol hapus */}
           <button 
                onClick={(e) => {
                    e.stopPropagation() // Cegah buka/tutup
                    onDelete()
                }} 
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
           </button>
        </div>
      </div>

      {isOpen && (
        <div 
            // 4. Stop propagation di area konten agar saat ngetik tidak menutup bab
            onClick={(e) => e.stopPropagation()} 
            onPointerDown={(e) => e.stopPropagation()} 
            onKeyDown={(e) => e.stopPropagation()}
        >
           <ModuleItemManager moduleId={id} items={items} classroomId={classroomId} />
        </div>
      )}
    </div>
  )
}

// --- 2. Main Component ---
export default function ModuleList({ 
    initialModules, 
    classroomId 
}: { 
    initialModules: any[], 
    classroomId: string 
}) {
  const [modules, setModules] = useState(initialModules)
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Sinkronisasi state jika props berubah (revalidate dari server)
  useEffect(() => {
    setModules(initialModules)
  }, [initialModules])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Ganti handleDragEnd yang lama dengan yang ini:
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over?.id) {
      // 1. Ambil index lama dan baru berdasarkan state 'modules' saat ini
      const oldIndex = modules.findIndex((item) => item.id === active.id)
      const newIndex = modules.findIndex((item) => item.id === over?.id)
      
      // 2. Hitung susunan baru
      const newItems = arrayMove(modules, oldIndex, newIndex)
      
      // 3. Update State Lokal (Optimistic UI) - Langsung set, jangan pakai callback function
      setModules(newItems)
      
      // 4. Update Server (Side Effect) - Dilakukan DI LUAR setModules
      const updates = newItems.map((item, index) => ({
          id: item.id,
          order: index + 1
      }))
      
      startTransition(() => {
         reorderModulesAction(updates, classroomId)
      })
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Daftar Bab / Modul</h2>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100"
        >
            <Plus size={16} /> Tambah Bab
        </button>
      </div>

      {/* Form Tambah Bab */}
      {isAdding && (
        <form 
            action={async (formData) => {
                await createModuleAction(formData)
                setIsAdding(false)
            }} 
            className="mb-6 p-4 bg-slate-50 rounded-lg border border-indigo-100"
        >
            <input type="hidden" name="classroomId" value={classroomId} />
            <div className="flex gap-2">
                <input 
                    name="title" 
                    autoFocus
                    placeholder="Judul Bab (Contoh: Aljabar Linear)" 
                    className="flex-1 border-slate-300 rounded-md px-3 py-2 text-sm border"
                    required
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium">Simpan</button>
            </div>
        </form>
      )}

      {/* Area Drag & Drop */}
      <DndContext id="course-builder-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {modules.map((module) => (
              <SortableItem 
                key={module.id} 
                id={module.id} 
                title={module.title}
                items={module.module_items || []} // Pass items
                classroomId={classroomId} // Pass classroomId
                onDelete={() => {
                    if(confirm('Hapus bab ini?')) deleteModuleAction(module.id, classroomId)
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {modules.length === 0 && !isAdding && (
          <p className="text-center text-slate-400 italic py-8">Belum ada materi. Klik "Tambah Bab" untuk memulai.</p>
      )}
    </div>
  )
}