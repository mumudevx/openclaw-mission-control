"use client";

import { useState } from "react";
import { FileText, ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgentFilesList, useAgentFileGet, useAgentFileSave } from "@/hooks/useAgents";
import type { Agent } from "@/types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AgentFiles({ agent }: { agent: Agent }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (selectedFile) {
    return (
      <FileEditor
        agentId={agent.id}
        fileName={selectedFile}
        onBack={() => setSelectedFile(null)}
      />
    );
  }

  return <FileList agentId={agent.id} onSelectFile={setSelectedFile} />;
}

function FileList({ agentId, onSelectFile }: { agentId: string; onSelectFile: (name: string) => void }) {
  const { data, isLoading, error } = useAgentFilesList(agentId);
  const files = data?.files ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <AlertCircle className="h-6 w-6 text-red-400" strokeWidth={1.5} />
        <p className="text-sm text-[var(--content-muted)]">Failed to load files</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-[var(--content-muted)]">No workspace files found</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-2">
      {files.map((file) => (
        <button
          key={file.name}
          onClick={() => onSelectFile(file.name)}
          className="w-full flex items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-3.5 text-left transition-shadow hover:shadow-card-hover"
        >
          <FileText className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--content-primary)]">{file.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-[var(--content-muted)]">
                {formatSize(file.size)}
              </span>
              {file.updatedAtMs > 0 && (
                <span className="text-[11px] text-[var(--content-muted)]">
                  {formatDistanceToNow(new Date(file.updatedAtMs), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          {file.missing && <StatusBadge status="idle" label="missing" />}
        </button>
      ))}
    </div>
  );
}

function FileEditor({ agentId, fileName, onBack }: { agentId: string; fileName: string; onBack: () => void }) {
  const { data, isLoading } = useAgentFileGet(agentId, fileName);
  const saveMutation = useAgentFileSave();
  const [content, setContent] = useState<string | null>(null);
  const [hasEdited, setHasEdited] = useState(false);

  // Initialize content from fetched data (gateway wraps in file object)
  const fileData = data?.file;
  const displayContent = content ?? fileData?.content ?? "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  async function handleSave() {
    try {
      await saveMutation.mutateAsync({ agentId, name: fileName, content: content ?? "" });
      toast.success(`${fileName} saved`);
      setHasEdited(false);
    } catch {
      toast.error(`Failed to save ${fileName}`);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between border-b border-[var(--border-divider)] px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--content-muted)] hover:bg-[var(--surface-bg)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-[var(--content-primary)]">{fileName}</span>
          </div>
          {fileData?.missing && <StatusBadge status="idle" label="missing" />}
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !hasEdited}
          className="flex items-center gap-1.5 rounded-btn bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          Save
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-5 min-h-0">
        <Textarea
          value={displayContent}
          onChange={(e) => {
            setContent(e.target.value);
            setHasEdited(true);
          }}
          placeholder={fileData?.missing ? "This file doesn't exist yet. Start typing to create it." : ""}
          className="h-full w-full resize-none rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] font-mono text-sm leading-relaxed min-h-[300px]"
        />
      </div>
    </div>
  );
}
