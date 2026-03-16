"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

type CommentRow = {
  id: string;
  post_slug: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  body: string;
  is_admin: boolean;
  created_at: string;
  likes_count: number;
};

declare global {
  interface Window {
    turnstile?: {
      reset: (selector?: string) => void;
    };
  }
}

function getVisitorToken() {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem("blog_visitor_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("blog_visitor_token", token);
  }
  return token;
}

export default function BlogComments({ postSlug }: { postSlug: string }) {
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    body: "",
  });

  async function loadComments() {
    setLoading(true);

    const res = await fetch("/api/blog/comments/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_slug: postSlug }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setRows([]);
      return;
    }

    setRows(data.rows || []);
  }

  useEffect(() => {
    loadComments();
  }, [postSlug]);

  useEffect(() => {
    async function checkAdmin() {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.isAdmin) {
        setIsAdmin(true);
      }
    }

    checkAdmin();
  }, []);

  const rootComments = useMemo(
    () => rows.filter((r) => !r.parent_id),
    [rows]
  );

  const repliesMap = useMemo(() => {
    const map: Record<string, CommentRow[]> = {};
    rows.forEach((r) => {
      if (r.parent_id) {
        if (!map[r.parent_id]) map[r.parent_id] = [];
        map[r.parent_id].push(r);
      }
    });
    return map;
  }, [rows]);

  async function submitComment(parent_id: string | null = null) {
    setMsg("");

    if (!form.author_name.trim() || !form.body.trim()) {
      setMsg("Name and comment are required.");
      return;
    }

    if (!isAdmin && !turnstileToken) {
      setMsg("Please complete the spam protection check.");
      return;
    }

    const res = await fetch("/api/blog/comments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_slug: postSlug,
        parent_id,
        author_name: form.author_name,
        author_email: form.author_email,
        body: form.body,
        turnstileToken,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to post comment.");
      return;
    }

    setForm({
      author_name: "",
      author_email: "",
      body: "",
    });
    setReplyingTo(null);
    setTurnstileToken("");

    if (window.turnstile && !isAdmin) {
      try {
        window.turnstile.reset();
      } catch {}
    }

    setMsg(
      isAdmin
        ? "Comment posted successfully."
        : "Comment submitted successfully and is awaiting approval."
    );

    await loadComments();
  }

  async function likeComment(commentId: string) {
  if (!commentId) {
    alert("Comment id is missing.");
    return;
  }

  const visitorToken = getVisitorToken();

  if (!visitorToken) {
    alert("Visitor token is missing.");
    return;
  }

  const res = await fetch("/api/blog/comments/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      comment_id: commentId,
      visitor_token: visitorToken,
    }),
  });

  const data = await res.json().catch(() => null);

if (!res.ok || !data?.ok) {
  if (data?.message === "You already liked this comment.") {
    setMsg("You already liked this comment.");
    return;
  }

  alert(data?.message || "Could not like comment.");
  console.log("LIKE DEBUG:", data);
  return;
}

  await loadComments();
}

  async function deleteComment(commentId: string) {
    const ok = confirm("Delete this comment?");
    if (!ok) return;

    const res = await fetch("/api/admin/blog/comments/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentId }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Delete failed.");
      return;
    }

    await loadComments();
  }

  return (
    <div className="mt-12 rounded-2xl border bg-white p-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />

      <h2 className="text-2xl font-extrabold text-slate-900">Comments</h2>

      <div className="mt-6 space-y-4 rounded-xl border bg-slate-50 p-5">
        {msg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {msg}
          </div>
        ) : null}

        <input
          value={form.author_name}
          onChange={(e) => setForm((p) => ({ ...p, author_name: e.target.value }))}
          placeholder="Your name"
          className="w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none"
        />

        <input
          value={form.author_email}
          onChange={(e) => setForm((p) => ({ ...p, author_email: e.target.value }))}
          placeholder="Your email (optional)"
          className="w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none"
          type="email"
        />

        <textarea
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          placeholder={replyingTo ? "Write your reply..." : "Write a comment..."}
          className="min-h-[120px] w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none"
        />

        {!isAdmin ? (
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-callback="onTurnstileSuccess"
            data-error-callback="onTurnstileError"
          />
        ) : null}

        <Script id="turnstile-callbacks" strategy="afterInteractive">
          {`
            window.onTurnstileSuccess = function(token) {
              window.dispatchEvent(new CustomEvent("turnstile-success", { detail: token }));
            };
            window.onTurnstileError = function() {
              window.dispatchEvent(new CustomEvent("turnstile-error"));
            };
          `}
        </Script>

        <TurnstileEventBridge
          onSuccess={(token) => setTurnstileToken(token)}
          onError={() => setMsg("Spam protection failed to load. Please refresh and try again.")}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => submitComment(replyingTo)}
            className="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            {replyingTo ? "Post Reply" : "Post Comment"}
          </button>

          {replyingTo ? (
            <button
              onClick={() => setReplyingTo(null)}
              className="rounded-lg border px-5 py-3 font-semibold hover:bg-slate-50"
            >
              Cancel Reply
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {loading ? (
          <p className="text-slate-600">Loading comments...</p>
        ) : rootComments.length === 0 ? (
          <p className="text-slate-600">No comments yet. Be the first to comment.</p>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id} className="rounded-xl border p-5">
              <CommentCard
                comment={comment}
                isAdmin={isAdmin}
                onReply={() => setReplyingTo(comment.id)}
                onLike={() => likeComment(comment.id)}
                onDelete={() => deleteComment(comment.id)}
              />

              {repliesMap[comment.id]?.length ? (
                <div className="mt-4 space-y-4 border-l pl-4">
                  {repliesMap[comment.id].map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      isAdmin={isAdmin}
                      isReply
                      onReply={() => setReplyingTo(comment.id)}
                      onLike={() => likeComment(reply.id)}
                      onDelete={() => deleteComment(reply.id)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TurnstileEventBridge({
  onSuccess,
  onError,
}: {
  onSuccess: (token: string) => void;
  onError: () => void;
}) {
  useEffect(() => {
    const successHandler = (e: Event) => {
      const token = (e as CustomEvent<string>).detail;
      onSuccess(token);
    };

    const errorHandler = () => {
      onError();
    };

    window.addEventListener("turnstile-success", successHandler);
    window.addEventListener("turnstile-error", errorHandler);

    return () => {
      window.removeEventListener("turnstile-success", successHandler);
      window.removeEventListener("turnstile-error", errorHandler);
    };
  }, [onSuccess, onError]);

  return null;
}

function CommentCard({
  comment,
  isAdmin,
  onReply,
  onLike,
  onDelete,
  isReply = false,
}: {
  comment: CommentRow;
  isAdmin: boolean;
  onReply: () => void;
  onLike: () => void;
  onDelete: () => void;
  isReply?: boolean;
}) {
  return (
    <div className={`${isReply ? "bg-slate-50" : "bg-white"} rounded-lg p-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-bold text-slate-900">{comment.author_name}</p>
        {comment.is_admin ? (
          <span className="rounded-full bg-fuchsia-100 px-2 py-1 text-xs font-semibold text-fuchsia-700">
            Admin
          </span>
        ) : null}
        <span className="text-xs text-slate-500">
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-slate-700">{comment.body}</p>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={onLike}
          className="text-sm font-semibold text-teal-700 hover:underline"
        >
          Like ({comment.likes_count})
        </button>
        <button
          onClick={onReply}
          className="text-sm font-semibold text-slate-700 hover:underline"
        >
          Reply
        </button>
        {isAdmin ? (
          <button
            onClick={onDelete}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}