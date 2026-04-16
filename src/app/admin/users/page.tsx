"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/users";
import AdminTable, {
  type AdminTableColumn,
} from "@/components/admin/AdminTable";

const PAGE_SIZE = 20;

function formatDate(createdAt: unknown): string {
  try {
    const ts = createdAt as { toDate?: () => Date };
    const date = ts?.toDate?.() ?? new Date(createdAt as string);
    return date.toLocaleDateString("en-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "--";
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pageHistory, setPageHistory] = useState<(DocumentSnapshot | null)[]>([
    null,
  ]);

  // Add user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(
    async (cursor: DocumentSnapshot | null = null) => {
      setLoading(true);
      try {
        const result = await getUsers({
          pageSize: PAGE_SIZE,
          lastDoc: cursor,
        });
        setUsers(result.items);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(null);
  }, [fetchUsers]);

  function handleNextPage() {
    if (!hasMore || !lastDoc) return;
    setPageHistory((prev) => [...prev, lastDoc]);
    setPage((p) => p + 1);
    fetchUsers(lastDoc);
  }

  function handlePrevPage() {
    if (page <= 1) return;
    const newHistory = [...pageHistory];
    newHistory.pop();
    setPageHistory(newHistory);
    setPage((p) => p - 1);
    fetchUsers(newHistory[newHistory.length - 1]);
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      await createUser({
        name: addName.trim(),
        email: addEmail.trim(),
        phone: addPhone.trim() || "",
      });
      setAddName("");
      setAddEmail("");
      setAddPhone("");
      setShowAddForm(false);
      // Refresh from page 1
      setPage(1);
      setPageHistory([null]);
      await fetchUsers(null);
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Failed to create user"
      );
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(user: User) {
    setEditingId(user.id ?? null);
    setEditName(user.name);
    setEditPhone(user.phone ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditPhone("");
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setEditLoading(true);
    try {
      await updateUser(editingId, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
      });
      cancelEdit();
      const cursor = pageHistory[pageHistory.length - 1];
      await fetchUsers(cursor);
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(user: User) {
    if (!user.id) return;
    const confirmed = window.confirm(`Delete user ${user.name}?`);
    if (!confirmed) return;
    try {
      await deleteUser(user.id);
      const cursor = pageHistory[pageHistory.length - 1];
      await fetchUsers(cursor);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  }

  const columns: AdminTableColumn<User>[] = [
    {
      key: "name",
      label: "Name",
      render: (item) =>
        editingId === item.id ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-lg border border-nino-200/30 bg-white px-2.5 py-1.5 font-body text-sm text-nino-800 outline-none focus:border-nino-500"
          />
        ) : (
          <span className="font-body text-sm font-medium text-nino-800">
            {item.name}
          </span>
        ),
    },
    {
      key: "email",
      label: "Email",
      render: (item) => (
        <span className="font-body text-sm text-nino-800/70">
          {item.email}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (item) =>
        editingId === item.id ? (
          <input
            type="text"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full rounded-lg border border-nino-200/30 bg-white px-2.5 py-1.5 font-body text-sm text-nino-800 outline-none focus:border-nino-500"
            placeholder="Optional"
          />
        ) : (
          <span className="font-body text-sm text-nino-800/60">
            {item.phone || "\u2014"}
          </span>
        ),
    },
    {
      key: "orders",
      label: "Orders",
      width: "100px",
      render: (item) => (
        <span className="font-display text-sm font-semibold text-nino-600">
          {item.orders?.length ?? 0}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      width: "120px",
      render: (item) => (
        <span className="font-body text-xs text-nino-800/50">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "140px",
      render: (item) =>
        editingId === item.id ? (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveEdit();
              }}
              disabled={editLoading}
              className="rounded-lg bg-nino-600 px-3 py-1.5 font-display text-xs font-semibold text-white transition-colors hover:bg-nino-700 disabled:opacity-50"
            >
              {editLoading ? "..." : "Save"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelEdit();
              }}
              className="rounded-lg border border-nino-200/20 px-3 py-1.5 font-display text-xs font-medium text-nino-800/60 transition-colors hover:bg-nino-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEdit(item);
              }}
              className="rounded-lg border border-nino-200/20 px-3 py-1.5 font-display text-xs font-medium text-nino-800/60 transition-colors hover:bg-nino-50 hover:text-nino-800"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              className="rounded-lg border border-red-200/30 px-3 py-1.5 font-display text-xs font-medium text-red-500/70 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ),
    },
  ];

  const tableData = users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-nino-950">
            Users
          </h1>
          <p className="mt-1 font-body text-sm text-nino-800/40">
            Manage customer profiles
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setAddError("");
          }}
          className="rounded-lg bg-nino-950 px-4 py-2 font-display text-xs font-semibold text-white transition-colors hover:bg-nino-800"
        >
          {showAddForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddUser}
          className="rounded-xl border border-nino-200/15 bg-white p-5"
        >
          <h2 className="mb-4 font-display text-sm font-semibold text-nino-800">
            New User
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                Name *
              </label>
              <input
                type="text"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full rounded-lg border border-nino-200/30 bg-white px-3 py-2 font-body text-sm text-nino-800 outline-none focus:border-nino-500"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="mb-1 block font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                Email *
              </label>
              <input
                type="email"
                required
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="w-full rounded-lg border border-nino-200/30 bg-white px-3 py-2 font-body text-sm text-nino-800 outline-none focus:border-nino-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block font-display text-[11px] font-medium uppercase tracking-[0.15em] text-nino-800/40">
                Phone
              </label>
              <input
                type="text"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                className="w-full rounded-lg border border-nino-200/30 bg-white px-3 py-2 font-body text-sm text-nino-800 outline-none focus:border-nino-500"
                placeholder="Optional"
              />
            </div>
          </div>
          {addError && (
            <p className="mt-3 font-body text-sm text-red-500">{addError}</p>
          )}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={addLoading}
              className="rounded-lg bg-nino-600 px-5 py-2 font-display text-xs font-semibold text-white transition-colors hover:bg-nino-700 disabled:opacity-50"
            >
              {addLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <AdminTable
        columns={columns}
        data={tableData}
        loading={loading}
        emptyMessage="No users yet"
        pagination={{
          page,
          hasMore,
          onNext: handleNextPage,
          onPrev: handlePrevPage,
        }}
      />
    </div>
  );
}
