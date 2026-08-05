import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, 
  Quote, Undo, Redo, RemoveFormatting, Eye, Edit3, Upload
} from 'lucide-react';
import { renderRichTextHtml } from '../utils/textParser';

export default function RichTextEditor({ value, onChange, onUploadImage, isUploading }) {
  const editorRef = useRef(null);
  const [activeMode, setActiveMode] = useState('edit');
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const initialHtml = renderRichTextHtml(value || '');
      if (editorRef.current.innerHTML !== initialHtml) {
        editorRef.current.innerHTML = initialHtml;
      }
    }
  }, [value, activeMode]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  };

  const execCmd = (command, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleFormatBlock = (headingTag) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let parent = selection.anchorNode;
      while (parent && parent !== editorRef.current) {
        if (parent.nodeName.toLowerCase() === headingTag.toLowerCase()) {
          document.execCommand('formatBlock', false, '<p>');
          handleInput();
          return;
        }
        parent = parent.parentNode;
      }
    }

    document.execCommand('formatBlock', false, `<${headingTag}>`);
    handleInput();
  };

  const handleInsertImage = async (file) => {
    if (!file || !onUploadImage) return;
    const url = await onUploadImage(file);
    if (url) {
      if (editorRef.current) {
        editorRef.current.focus();
        const imgHtml = `<img src="${url}" alt="Brand Photo" class="rich-img" style="max-width:100%; height:auto; border-radius:12px; margin:16px 0; display:block;" /><p><br></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();
      }
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleInsertImage(file);
            return;
          }
        }
      }
    }
  };

  return (
    <div className="rich-editor-container" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
      {/* Toolbar */}
      <div className="rich-editor-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', backgroundColor: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {/* Undo / Redo */}
          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('undo')}
            title="Undo (Cmd + Z)"
            style={btnStyle}
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('redo')}
            title="Redo (Cmd + Shift + Z)"
            style={btnStyle}
          >
            <Redo size={15} />
          </button>

          <div style={dividerStyle} />

          {/* Headings */}
          <button
            type="button"
            className="editor-btn"
            onClick={() => handleFormatBlock('h1')}
            title="Title (H1)"
            style={{ ...btnStyle, fontWeight: 'bold' }}
          >
            <Heading1 size={16} />
          </button>

          <button
            type="button"
            className="editor-btn"
            onClick={() => handleFormatBlock('h2')}
            title="Heading (H2)"
            style={{ ...btnStyle, fontWeight: 'bold' }}
          >
            <Heading2 size={16} />
          </button>

          <button
            type="button"
            className="editor-btn"
            onClick={() => handleFormatBlock('h3')}
            title="Subheading (H3)"
            style={{ ...btnStyle, fontWeight: 'bold' }}
          >
            <Heading3 size={16} />
          </button>

          <div style={dividerStyle} />

          {/* Inline Styles */}
          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('bold')}
            title="Bold (Cmd + B)"
            style={{ ...btnStyle, fontWeight: 'bold' }}
          >
            <Bold size={15} />
          </button>

          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('italic')}
            title="Italic (Cmd + I)"
            style={{ ...btnStyle, fontStyle: 'italic' }}
          >
            <Italic size={15} />
          </button>

          <div style={dividerStyle} />

          {/* Bulk Lists */}
          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('insertUnorderedList')}
            title="Bullet List (Bulk Multi-line)"
            style={btnStyle}
          >
            <List size={16} />
          </button>

          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('insertOrderedList')}
            title="Numbered List (Bulk Multi-line)"
            style={btnStyle}
          >
            <ListOrdered size={16} />
          </button>

          <button
            type="button"
            className="editor-btn"
            onClick={() => handleFormatBlock('blockquote')}
            title="Quote Block"
            style={btnStyle}
          >
            <Quote size={15} />
          </button>

          <div style={dividerStyle} />

          {/* Remove Format */}
          <button
            type="button"
            className="editor-btn"
            onClick={() => execCmd('removeFormat')}
            title="Clear Formatting"
            style={btnStyle}
          >
            <RemoveFormatting size={15} />
          </button>

          <div style={dividerStyle} />

          {/* Image Upload */}
          <label 
            className="editor-btn" 
            title="Insert Image (Upload or Paste)" 
            style={{ ...btnStyle, cursor: 'pointer', backgroundColor: '#8b0000', color: '#fff', padding: '4px 10px', gap: '6px' }}
          >
            <Upload size={13} />
            <span style={{ fontSize: '11px', fontWeight: '500' }}>{isUploading ? 'Uploading...' : 'Image'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleInsertImage(e.target.files[0]);
                  e.target.value = '';
                }
              }}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
          <button
            type="button"
            onClick={() => setActiveMode('edit')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeMode === 'edit' ? '#ffffff' : 'transparent',
              color: activeMode === 'edit' ? '#8b0000' : '#64748b',
              boxShadow: activeMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('preview')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: activeMode === 'preview' ? '#ffffff' : 'transparent',
              color: activeMode === 'preview' ? '#8b0000' : '#64748b',
              boxShadow: activeMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Eye size={12} /> Live Preview
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeMode === 'edit' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          className="about-us-rich-content editor-body"
          style={{
            minHeight: '320px',
            padding: '16px',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '14.5px',
            lineHeight: '1.85',
            color: '#1a1a1a',
            backgroundColor: '#ffffff'
          }}
        />
      ) : (
        <div
          className="about-us-rich-content preview-body"
          dangerouslySetInnerHTML={{ __html: renderRichTextHtml(value || '') }}
          style={{
            minHeight: '320px',
            padding: '16px',
            backgroundColor: '#fafaf9'
          }}
        />
      )}
    </div>
  );
}

const btnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 9px',
  fontSize: '12px',
  borderRadius: '4px',
  border: '1px solid var(--color-border)',
  backgroundColor: '#ffffff',
  color: '#334155',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const dividerStyle = {
  width: '1px',
  height: '18px',
  backgroundColor: '#cbd5e1',
  margin: '0 3px'
};
