/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlogPost } from '../types';
import {
  Calendar,
  User,
  Tag,
  Globe,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen,
  Code,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface PostDetailProps {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onRevert: () => void;
  isActionLoading: boolean;
}

export default function PostDetail({
  post,
  onEdit,
  onDelete,
  onPublish,
  onRevert,
  isActionLoading,
}: PostDetailProps) {
  const [viewTab, setViewTab] = useState<'preview' | 'html'>('preview');

  const formattedPublished = post.published
    ? new Date(post.published).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not published';

  const formattedUpdated = post.updated
    ? new Date(post.updated).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never updated';

  const statusLabel = post.status || 'DRAFT';

  // Return status color theme
  const getStatusStyle = () => {
    switch (statusLabel) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          dot: 'bg-emerald-500',
          icon: <CheckCircle size={12} className="text-emerald-500" />,
        };
      case 'SCHEDULED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-100',
          dot: 'bg-blue-500',
          icon: <Clock size={12} className="text-blue-500" />,
        };
      case 'DRAFT':
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          dot: 'bg-amber-500',
          icon: <AlertCircle size={12} className="text-amber-500" />,
        };
    }
  };

  const currentStatusStyle = getStatusStyle();

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm h-full overflow-hidden">
      {/* Detail Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 bg-gray-50/30 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStatusStyle.bg}`}
          >
            {currentStatusStyle.icon}
            <span className="tracking-wide uppercase">{statusLabel}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEdit}
            disabled={isActionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 bg-white font-medium text-xs transition-all disabled:opacity-50"
            title="Edit this post"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>

          {statusLabel === 'DRAFT' ? (
            <button
              onClick={onPublish}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs shadow-sm shadow-indigo-100 hover:shadow-indigo-200 transition-all disabled:opacity-50"
              title="Publish this draft post immediately"
            >
              <Globe size={13} />
              <span>Publish</span>
            </button>
          ) : (
            <button
              onClick={onRevert}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 font-medium text-xs transition-all disabled:opacity-50"
              title="Revert published post to Draft"
            >
              <FileText size={13} />
              <span>Revert to Draft</span>
            </button>
          )}

          <div className="w-[1px] h-4 bg-gray-200 mx-1" />

          <button
            onClick={onDelete}
            disabled={isActionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 border border-red-100 bg-white font-medium text-xs transition-all disabled:opacity-50"
            title="Delete post permanently"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Content Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Subheader / Meta */}
          <div className="flex flex-wrap items-center text-xs gap-y-2 gap-x-4 text-gray-400 font-medium pb-4 border-b border-gray-100">
            {post.author && (
              <div className="flex items-center gap-1.5">
                {post.author.image?.url ? (
                  <img
                    src={post.author.image.url}
                    alt={post.author.displayName}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full border border-gray-100"
                  />
                ) : (
                  <User size={13} />
                )}
                <span>{post.author.displayName}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Calendar size={13} />
              <span>Published: {formattedPublished}</span>
            </div>

            <span className="hidden sm:inline text-gray-200">•</span>

            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>Updated: {formattedUpdated}</span>
            </div>

            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 font-semibold"
              >
                <ExternalLink size={12} />
                <span>Live Post</span>
              </a>
            )}
          </div>
        </div>

        {/* Labels / Tags list */}
        {post.labels && post.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <Tag size={12} className="text-gray-400 shrink-0" />
            {post.labels.map((label) => (
              <span
                key={label}
                className="bg-gray-100 border border-gray-200/50 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded-md"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Preview / HTML Code tabs */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Post Body
            </span>
            <div className="flex rounded-md bg-gray-100 p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setViewTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all ${
                  viewTab === 'preview'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <BookOpen size={11} />
                <span>Reader Mode</span>
              </button>
              <button
                onClick={() => setViewTab('html')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all ${
                  viewTab === 'html'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <Code size={11} />
                <span>HTML Code</span>
              </button>
            </div>
          </div>

          {/* Render content */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 min-h-[300px]">
            {viewTab === 'preview' ? (
              <div
                id="post-preview-render"
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <pre
                id="post-html-source"
                className="bg-gray-50/50 leading-relaxed overflow-x-auto rounded-lg text-xs font-mono p-4 text-gray-600 border border-gray-200/50 whitespace-pre-wrap select-all"
              >
                {post.content}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
