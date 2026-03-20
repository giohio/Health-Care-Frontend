import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const TABS = [
  { key: 'all', label: 'All', count: 156 },
  { key: 'patients', label: 'Patients', count: 132 },
  { key: 'doctors', label: 'Doctors', count: 12 },
  { key: 'admins', label: 'Admins', count: 2 },
]

const USERS = [
  {
    id: 'P-1001',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    role: 'patient',
    status: 'active',
    joined: 'Mar 1 2025',
    specialty: 'General',
    initials: 'JD',
    avatar: 'from-indigo-500 to-blue-400',
  },
  {
    id: 'P-1002',
    name: 'Minh Tran',
    email: 'minh.tran@email.com',
    role: 'patient',
    status: 'active',
    joined: 'Feb 28 2025',
    specialty: 'General',
    initials: 'MT',
    avatar: 'from-teal-500 to-cyan-400',
  },
  {
    id: 'P-1003',
    name: 'Linh Pham',
    email: 'linh.pham@email.com',
    role: 'patient',
    status: 'active',
    joined: 'Feb 20 2025',
    specialty: 'General',
    initials: 'LP',
    avatar: 'from-rose-500 to-fuchsia-400',
  },
  {
    id: 'P-1004',
    name: 'Nam Nguyen',
    email: 'nam.nguyen@email.com',
    role: 'patient',
    status: 'inactive',
    joined: 'Jan 15 2025',
    specialty: 'General',
    initials: 'NN',
    avatar: 'from-slate-500 to-slate-400',
  },
  {
    id: 'P-1005',
    name: 'Thu Le',
    email: 'thu.le@email.com',
    role: 'patient',
    status: 'active',
    joined: 'Mar 10 2025',
    specialty: 'General',
    initials: 'TL',
    avatar: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'P-1006',
    name: 'Bao Nguyen',
    email: 'bao.nguyen@email.com',
    role: 'patient',
    status: 'pending',
    joined: 'Mar 18 2025',
    specialty: 'General',
    initials: 'BN',
    avatar: 'from-amber-500 to-orange-400',
  },
  {
    id: 'P-1007',
    name: 'Mai Thi',
    email: 'mai.thi@email.com',
    role: 'patient',
    status: 'active',
    joined: 'Dec 5 2024',
    specialty: 'General',
    initials: 'MT',
    avatar: 'from-violet-500 to-indigo-400',
  },
  {
    id: 'P-1008',
    name: 'Duc Pham',
    email: 'duc.pham@email.com',
    role: 'patient',
    status: 'active',
    joined: 'Nov 20 2024',
    specialty: 'General',
    initials: 'DP',
    avatar: 'from-sky-500 to-blue-400',
  },
  {
    id: 'D-2001',
    name: 'Dr. Sarah Chen',
    email: 'dr.chen@healthai.vn',
    role: 'doctor',
    status: 'active',
    joined: 'Jan 1 2024',
    specialty: 'General',
    initials: 'SC',
    avatar: 'from-teal-500 to-cyan-400',
  },
  {
    id: 'D-2002',
    name: 'Dr. Marcus Reid',
    email: 'dr.reid@healthai.vn',
    role: 'doctor',
    status: 'active',
    joined: 'Jan 1 2024',
    specialty: 'Cardiology',
    initials: 'MR',
    avatar: 'from-indigo-500 to-violet-400',
  },
  {
    id: 'D-2003',
    name: 'Dr. Linh Nguyen',
    email: 'dr.linh@healthai.vn',
    role: 'doctor',
    status: 'active',
    joined: 'Mar 1 2025',
    specialty: 'Neurology',
    initials: 'LN',
    avatar: 'from-cyan-500 to-teal-400',
  },
  {
    id: 'D-2004',
    name: 'Dr. Anh Pham',
    email: 'dr.anh@healthai.vn',
    role: 'doctor',
    status: 'inactive',
    joined: 'Jun 1 2024',
    specialty: 'General',
    initials: 'AP',
    avatar: 'from-slate-500 to-gray-400',
  },
  {
    id: 'D-2005',
    name: 'Dr. Bao Le',
    email: 'dr.bao@healthai.vn',
    role: 'doctor',
    status: 'active',
    joined: 'Feb 1 2025',
    specialty: 'Cardiology',
    initials: 'BL',
    avatar: 'from-emerald-500 to-lime-400',
  },
  {
    id: 'A-3001',
    name: 'Nguyen Van Admin',
    email: 'admin@healthai.vn',
    role: 'admin',
    status: 'active',
    joined: 'Jan 1 2024',
    specialty: 'General',
    initials: 'NA',
    avatar: 'from-rose-500 to-orange-400',
  },
  {
    id: 'A-3002',
    name: 'Tran Thi Manager',
    email: 'manager@healthai.vn',
    role: 'admin',
    status: 'active',
    joined: 'Jan 1 2024',
    specialty: 'General',
    initials: 'TM',
    avatar: 'from-fuchsia-500 to-rose-400',
  },
]

function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function UserXIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="18" y1="8" x2="23" y2="13" />
      <line x1="23" y1="8" x2="18" y2="13" />
    </svg>
  )
}

function UserCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}

function MoreHorizontalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function getRoleBadge(role) {
  if (role === 'patient') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-400'
  }

  if (role === 'doctor') {
    return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/50 dark:bg-teal-950/50 dark:text-teal-300'
  }

  return 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-400'
}

function getStatusNode(status) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
      </span>
    )
  }

  if (status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-[#404050]" />
        <span className="text-xs font-medium text-slate-400 dark:text-[#606070]">Inactive</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</span>
    </span>
  )
}

function matchesTab(activeTab, role) {
  if (activeTab === 'all') return true
  if (activeTab === 'patients') return role === 'patient'
  if (activeTab === 'doctors') return role === 'doctor'
  if (activeTab === 'admins') return role === 'admin'
  return true
}

export default function UserManagementView({ navigateTo, user }) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const [statusFilter, setStatusFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')

  const [newRole, setNewRole] = useState('patient')
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newConfirmPassword, setNewConfirmPassword] = useState('')

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return USERS.filter((entry) => {
      const tabPass = matchesTab(activeTab, entry.role)
      const statusPass = statusFilter === 'all' || entry.status === statusFilter
      const specialtyPass = activeTab !== 'doctors' || specialtyFilter === 'all' || entry.specialty.toLowerCase() === specialtyFilter
      const queryPass = query === ''
        || entry.name.toLowerCase().includes(query)
        || entry.email.toLowerCase().includes(query)
        || entry.id.toLowerCase().includes(query)

      return tabPass && statusPass && specialtyPass && queryPass
    })
  }, [activeTab, searchQuery, specialtyFilter, statusFilter])

  const closeModal = () => {
    setShowAddModal(false)
    setNewRole('patient')
    setNewFullName('')
    setNewEmail('')
    setNewSpecialty('')
    setNewPassword('')
    setNewConfirmPassword('')
  }

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-[#eeeef5]">User Management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#70708a]">156 total accounts</p>
            <span className="sr-only">Signed in as {user.name}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-rose-700 hover:shadow-[0_4px_12px_rgba(225,29,72,0.4)] active:scale-[0.98] dark:bg-rose-600 dark:hover:bg-rose-500"
          >
            <span className="inline-flex h-4 w-4"><UserPlusIcon /></span>
            <span>+ Add User</span>
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-[#eeeef5] dark:bg-[#eeeef5] dark:text-[#0c0c13]'
                    : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-[#252530] dark:text-[#70708a] dark:hover:border-[#353545] dark:hover:bg-[#16161e] dark:hover:text-[#c8c8e0]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#0c0c13]'
                    : 'bg-slate-100 text-slate-600 dark:bg-[#1c1c25] dark:text-[#9898b0]'
                }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-600 transition-all duration-150 hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:text-[#eeeef5] dark:hover:border-[#353545] sm:max-w-sm">
            <span className="inline-flex h-4 w-4 text-slate-400 dark:text-[#606070]" aria-hidden="true"><SearchIcon /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-[#eeeef5] dark:placeholder:text-[#505060]"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:hover:border-[#353545]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            disabled={activeTab !== 'doctors'}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#252530] dark:bg-[#111118] dark:text-[#c8c8e0] dark:hover:border-[#353545]"
          >
            <option value="all">All</option>
            <option value="general">General</option>
            <option value="neurology">Neurology</option>
            <option value="cardiology">Cardiology</option>
          </select>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#252530] dark:bg-[#111118]">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-4 dark:border-[#252530] dark:bg-gradient-to-r dark:from-[#0c0c13] dark:to-[#111118]">
            <p className="col-span-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">User</p>
            <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">Role</p>
            <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">Status</p>
            <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">Joined</p>
            <p className="col-span-2 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-[#b0b0c8]">Actions</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1c1c25]">
            {filteredUsers.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-[#16161e]"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${entry.avatar}`}>
                    {entry.initials}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-[#eeeef5]">{entry.name}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-[#70708a]">{entry.email}</span>
                  </span>
                </div>

                <div className="col-span-2">
                  <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold capitalize ${getRoleBadge(entry.role)}`}>
                    {entry.role}
                  </span>
                </div>

                <div className="col-span-2">{getStatusNode(entry.status)}</div>

                <div className="col-span-2">
                  <span className="text-xs text-slate-500 dark:text-[#70708a]">{entry.joined}</span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    title="Edit"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                  >
                    <span className="inline-flex h-3.5 w-3.5 text-slate-400 dark:text-[#606070]"><PencilIcon /></span>
                  </button>

                  {entry.status === 'active' ? (
                    <button
                      type="button"
                      title="Deactivate"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <span className="inline-flex h-3.5 w-3.5 text-rose-400"><UserXIcon /></span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Activate"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <span className="inline-flex h-3.5 w-3.5 text-emerald-500"><UserCheckIcon /></span>
                    </button>
                  )}

                  <button
                    type="button"
                    title="More"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-[#1c1c25]"
                  >
                    <span className="inline-flex h-3.5 w-3.5 text-slate-400 dark:text-[#606070]"><MoreHorizontalIcon /></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-[#70708a]">Showing 1-15 of 156 users</p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 text-slate-500 opacity-40 dark:border-[#252530] dark:text-[#70708a]"
            >
              <span className="inline-flex h-4 w-4"><ChevronLeftIcon /></span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white"
              >
                1
              </button>
              <button
                type="button"
                className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
              >
                2
              </button>
              <button
                type="button"
                className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
              >
                3
              </button>
              <span className="px-1 text-sm text-slate-400 dark:text-[#606070]">...</span>
              <button
                type="button"
                className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-slate-200 px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#9898b0] dark:hover:bg-[#16161e]"
              >
                11
              </button>
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-[#252530] dark:text-[#70708a] dark:hover:bg-[#16161e]"
            >
              <span className="inline-flex h-4 w-4"><ChevronRightIcon /></span>
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <>
          <style>{`
            @keyframes modalIn {
              from {
                opacity: 0;
                transform: scale(0.94) translateY(8px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            @keyframes backdropIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>

          {/* BACKDROP */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center px-4"
            style={{
              animation: 'backdropIn 200ms ease forwards'
            }}
          >
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => setShowAddModal(false)}
              aria-label="Close add user modal"
            />

            {/* MODAL PANEL */}
            <div
              className="relative w-full max-w-md bg-white dark:bg-[#18181f] border border-slate-200 dark:border-[#2a2a3a] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
              style={{
                animation: 'modalIn 250ms cubic-bezier(0.34,1.56,0.64,1) forwards'
              }}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#252530] bg-white dark:bg-[#18181f]">
                <h2 className="text-base font-semibold text-slate-900 dark:text-[#eeeef5]">
                  Add New User
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#252530] transition-all duration-150 cursor-pointer"
                  aria-label="Close modal"
                >
                  <XIcon className="w-4 h-4 text-slate-500 dark:text-[#70708a]" />
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-5 bg-white dark:bg-[#18181f] flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="new-user-full-name" className="text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    id="new-user-full-name"
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="new-user-email" className="text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5 block">
                    Email
                  </label>
                  <input
                    id="new-user-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="new-user-role" className="text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5 block">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      id="new-user-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm appearance-none cursor-pointer bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-[#606070]">
                      <ChevronDownIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Specialty (conditional) */}
                <div
                  className="transition-all duration-200"
                  style={{
                    maxHeight: newRole === 'doctor' ? '80px' : '0',
                    opacity: newRole === 'doctor' ? 1 : 0,
                    overflow: 'hidden'
                  }}
                >
                  <label htmlFor="new-user-specialty" className="text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5 block">
                    Specialty
                  </label>
                  <input
                    id="new-user-specialty"
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="e.g. General Practice"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="new-user-password" className="text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5 block">
                    Password
                  </label>
                  <input
                    id="new-user-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="new-user-confirm-password" className="text-xs font-semibold text-slate-600 dark:text-[#9898b0] mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    id="new-user-confirm-password"
                    type="password"
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#111118] border border-slate-200 dark:border-[#252530] text-slate-900 dark:text-[#eeeef5] placeholder:text-slate-400 dark:placeholder:text-[#505060] focus:outline-none focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-150"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 dark:border-[#252530] bg-slate-50 dark:bg-[#111118]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-transparent border border-slate-200 dark:border-[#252530] text-slate-600 dark:text-[#9898b0] hover:bg-slate-100 dark:hover:bg-[#1c1c25] hover:border-slate-300 dark:hover:border-[#353545] transition-all duration-150 active:scale-[0.97]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeModal()
                    navigateTo('users')
                  }}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white hover:shadow-[0_4px_12px_rgba(244,63,94,0.35)] hover:-translate-y-px transition-all duration-150 active:scale-[0.97]"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

UserManagementView.propTypes = {
  navigateTo: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
