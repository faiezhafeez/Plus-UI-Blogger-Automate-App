/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { BlogPost } from '../types';
import {
  X,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Link2Off,
  Image as ImageIcon,
  Code,
  Eye,
  Undo,
  Redo,
  Loader2,
  Tag
} from 'lucide-react';

interface PostEditorProps {
  post?: BlogPost | null; // null if creating a new post
  onClose: () => void;
  onSave: (title: string, content: string, labels: string[], isDraft?: boolean) => Promise<void>;
  isSaving: boolean;
}

export default function PostEditor({ post, onClose, onSave, isSaving }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [labels, setLabels] = useState(post?.labels?.join(', ') || '');
  const [editMode, setEditMode] = useState<'visual' | 'html'>('visual');
  const [content, setContent] = useState(post?.content || '');

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync initial content to visual editor
  useEffect(() => {
    if (editorRef.current && editMode === 'visual') {
      editorRef.current.innerHTML = content;
    }
  }, [editMode]);

  const handleVisualChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleVisualChange();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleSave = (isDraftValue?: boolean) => {
    if (!title.trim()) {
      alert('Post Title cannot be empty.');
      return;
    }
    // Parse tags/labels
    const parsedLabels = labels
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Call save handler
    onSave(title, content, parsedLabels, isDraftValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div 
        id="editor-modal-container"
        className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
              {post ? 'Edit Blog Post' : 'Create New Post'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {post ? `Editing "${post.title}"` : 'Compose a beautiful post for your blog'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Post Title */}
          <div>
            <label htmlFor="post-title" className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">
              Post Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Demystifying the Google Blogger API"
              className="w-full text-lg font-medium border-b border-gray-200 focus:border-indigo-500 py-1.5 outline-none tracking-tight transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Labels / Tags */}
          <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 flex items-center gap-3">
            <Tag size={16} className="text-indigo-500 shrink-0" />
            <div className="flex-1">
              <label htmlFor="post-labels" className="block text-[10px] font-bold text-indigo-900/80 uppercase tracking-wider mb-0.5">
                Labels (comma-separated list)
              </label>
              <input
                id="post-labels"
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="tech, news, review, updates"
                className="w-full text-sm font-medium bg-transparent border-0 p-0 text-indigo-900 placeholder:text-indigo-300 outline-none"
              />
            </div>
          </div>

          {/* Content Editor Tab Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Post Content
            </span>
            <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setEditMode('visual')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-all ${
                  editMode === 'visual'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Eye size={13} />
                <span>Visual Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setEditMode('html')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition-all ${
                  editMode === 'html'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Code size={13} />
                <span>HTML Source</span>
              </button>
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden min-h-[350px] bg-white">
            {/* Visual Editor Toolbar */}
            {editMode === 'visual' && (
              <div 
                id="formatting-toolbar"
                className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50/50 shrink-0 select-none"
              >
                <button
                  type="button"
                  onClick={() => execCommand('undo')}
                  title="Undo (Ctrl+Z)"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <Undo size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('redo')}
                  title="Redo"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <Redo size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <button
                  type="button"
                  onClick={() => execCommand('bold')}
                  title="Bold"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 font-bold transition-all"
                >
                  <BoldIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('italic')}
                  title="Italic"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 italic transition-all"
                >
                  <ItalicIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('underline')}
                  title="Underline"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 underline transition-all"
                >
                  <UnderlineIcon size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<h1>')}
                  title="Heading 1"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all flex items-center"
                >
                  <Heading1 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<h2>')}
                  title="Heading 2"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all flex items-center"
                >
                  <Heading2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('formatBlock', '<p>')}
                  title="Paragraph"
                  className="px-2 py-1 text-xs text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all font-mono"
                >
                  p
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <button
                  type="button"
                  onClick={() => execCommand('insertUnorderedList')}
                  title="Bulleted List"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('insertOrderedList')}
                  title="Numbered List"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <ListOrdered size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <button
                  type="button"
                  onClick={insertLink}
                  title="Insert Link"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <Link size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => execCommand('unlink')}
                  title="Remove Link"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <Link2Off size={14} />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                <button
                  type="button"
                  onClick={insertImage}
                  title="Insert Image Link"
                  className="p-1.5 text-gray-600 rounded-md hover:bg-white hover:shadow-sm hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <ImageIcon size={14} />
                </button>
              </div>
            )}

            {/* Editor Canvas */}
            <div className="flex-1 min-h-[300px] flex">
              {editMode === 'visual' ? (
                <div
                  id="visual-editor-canvas"
                  ref={editorRef}
                  contentEditable
                  onInput={handleVisualChange}
                  className="flex-1 p-5 outline-none prose max-w-none overflow-y-auto max-h-[450px]"
                  style={{ minHeight: '300px' }}
                />
              ) : (
                <textarea
                  id="html-editor-textarea"
                  value={content}
                  onChange={handleHtmlChange}
                  placeholder="<h1>Post Title</h1><p>Write raw HTML here...</p>"
                  className="flex-1 p-5 font-mono text-xs text-gray-800 bg-gray-50/50 outline-none border-0 resize-none overflow-y-auto max-h-[450px]"
                  style={{ minHeight: '300px' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-400 font-mono">
            {content.length} characters written
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {/* If existing post, just show 'Save Changes'. If draft/new, show Publish/Save Draft options */}
            {post ? (
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:translate-y-[1px] text-white rounded-xl text-sm font-semibold shadow-md active:shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="px-5 py-2 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Draft</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 min-w-[130px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Post</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
