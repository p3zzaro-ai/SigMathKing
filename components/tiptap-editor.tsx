// components/tiptap-editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Youtube from '@tiptap/extension-youtube'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
// Import Math
import Mathematics from '@tiptap/extension-mathematics' 
import 'katex/dist/katex.min.css' // Import CSS KaTeX wajib!

import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Image as ImageIcon, 
  Youtube as YoutubeIcon, AlignLeft, AlignCenter, AlignRight,
  Sigma // Icon Matematika
} from 'lucide-react'

export default function TiptapEditor({ 
  content, 
  onChange 
}: { 
  content: string, 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Mathematics, // Aktifkan Math
      Youtube.configure({ width: 480, height: 320 }),
      Image.configure({ inline: true, allowBase64: true }),
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image', 'youtube'] }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] p-4 cursor-text'
        }
    }
  })

  if (!editor) return null

  // Fungsi Insert Rumus Cepat
  const addMath = () => {
    const formula = prompt('Masukkan rumus LaTeX (contoh: \\sqrt{x^2 + y^2}):')
    if (formula) {
        editor.chain().focus().insertContent(`$${formula}$`).run()
    }
  }

  const addYoutube = () => {
    const url = prompt('Masukkan URL YouTube:')
    if (url) editor.commands.setYoutubeVideo({ src: url })
  }

  const addImage = () => {
    const url = prompt('Masukkan URL Gambar:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border border-slate-300 rounded-md overflow-hidden bg-white flex flex-col">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
        
        {/* Basic Format */}
        <div className="flex bg-white rounded border border-slate-200">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive('bold') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}><Bold size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive('italic') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}><Italic size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive('underline') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}><UnderlineIcon size={16} /></button>
        </div>

        {/* Math Button (NEW) */}
        <div className="flex bg-white rounded border border-slate-200 ml-2">
             <button type="button" onClick={addMath} className="p-1.5 hover:bg-slate-100 text-slate-700" title="Insert Math Formula">
                <Sigma size={16} />
            </button>
        </div>

        {/* Alignment */}
        <div className="flex bg-white rounded border border-slate-200 ml-2">
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}><AlignLeft size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}><AlignCenter size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}><AlignRight size={16} /></button>
        </div>

        {/* Lists */}
        <div className="flex bg-white rounded border border-slate-200 ml-2">
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive('bulletList') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
            <List size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 hover:bg-slate-100 ${editor.isActive('orderedList') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
            <ListOrdered size={16} />
            </button>
        </div>

        {/* Media */}
        <div className="flex bg-white rounded border border-slate-200 ml-2">
            <button type="button" onClick={addYoutube} className="p-1.5 hover:bg-slate-100 text-red-600">
            <YoutubeIcon size={16} />
            </button>
            <button type="button" onClick={addImage} className="p-1.5 hover:bg-slate-100 text-green-600">
            <ImageIcon size={16} />
            </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  )
}