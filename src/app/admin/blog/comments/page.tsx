"use client";

import { useEffect, useState } from "react";

export default function AdminBlogCommentsPage() {
  const [rows, setRows] = useState([]);

  async function load() {
    const res = await fetch("/api/admin/blog/comments/list");

    const data = await res.json();

    if (data?.ok) setRows(data.rows || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    await fetch("/api/admin/blog/comments/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    load();
  }

  async function deleteComment(id: string) {
    await fetch("/api/admin/blog/comments/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    load();
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Blog Comment Moderation</h1>

      <div className="space-y-4">
        {rows.map((c: any) => (
          <div key={c.id} className="border p-4 rounded-xl">
            <p className="font-semibold">{c.author_name}</p>
            <p className="text-sm text-gray-500">{c.post_slug}</p>
            <p className="mt-2">{c.body}</p>

            <div className="mt-4 flex gap-3">
              {!c.is_approved && (
                <button
                  onClick={() => approve(c.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
              )}

              <button
                onClick={() => deleteComment(c.id)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}