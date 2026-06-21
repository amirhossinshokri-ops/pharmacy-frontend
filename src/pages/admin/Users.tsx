import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { adminAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string|null>(null)

  const { data, isLoading } = useQuery(
    ['admin-users', page, search],
    () => adminAPI.users({ page, limit: 15, ...(search && { search }) }),
    { keepPreviousData: true }
  )
  const users = data?.data?.data || []
  const meta  = data?.data?.meta

  const toggle = async (id: string) => {
    setTogglingId(id)
    try {
      await adminAPI.toggleUser(id)
      qc.invalidateQueries('admin-users')
      toast.success('وضعیت کاربر تغییر کرد')
    } catch { toast.error('خطا در تغییر وضعیت') }
    finally { setTogglingId(null) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">مدیریت کاربران</h1>
          {meta && <p className="text-xs text-gray-400 mt-0.5">{meta.total} کاربر</p>}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="bg-white border border-sage-200 rounded-2xl px-4 h-11 flex items-center gap-3 focus-within:border-primary-400 transition-colors">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="جستجوی نام، ایمیل یا موبایل..."
            className="bg-transparent outline-none w-full text-sm"/>
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-xmark text-sm"/>
            </button>
          )}
        </div>
      </div>

      {/* Desktop table header */}
      <div className="hidden sm:grid sm:grid-cols-5 px-4 py-2 text-xs font-semibold text-gray-400 mb-1">
        <span className="col-span-2">کاربر</span>
        <span>ایمیل</span>
        <span className="text-center">سفارشات</span>
        <span className="text-center">وضعیت</span>
      </div>

      {/* Users list */}
      <div className="space-y-2.5">
        {isLoading
          ? [...Array(6)].map((_,i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse"/>)
          : users.length === 0
            ? <div className="text-center py-12 text-gray-400 text-sm">کاربری یافت نشد</div>
            : users.map((user: any) => (
              <div key={user.id} className="bg-white rounded-2xl border border-sage-100 shadow-sm">
                {/* Mobile layout */}
                <div className="sm:hidden flex items-center gap-3 p-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${user.role==='ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                      {user.role==='ADMIN' && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">ادمین</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate" dir="ltr">{user.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{user._count?.orders||0} سفارش</p>
                  </div>
                  {user.role!=='ADMIN' && (
                    <button onClick={() => toggle(user.id)} disabled={togglingId===user.id}
                      className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${user.isActive ? 'bg-primary-500' : 'bg-gray-200'}`}>
                      {togglingId===user.id
                        ? <i className="fa-solid fa-circle-notch fa-spin text-white text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        : <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${user.isActive ? 'right-1' : 'left-1'}`}/>
                      }
                    </button>
                  )}
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:grid sm:grid-cols-5 items-center px-4 py-3 gap-3">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${user.role==='ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                        {user.role==='ADMIN' && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">ادمین</span>}
                      </div>
                      {user.phone && <p className="text-xs text-gray-400" dir="ltr">{user.phone}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate" dir="ltr">{user.email}</p>
                  <p className="text-xs text-gray-500 text-center">{user._count?.orders||0}</p>
                  <div className="flex justify-center">
                    {user.role==='ADMIN'
                      ? <span className="text-xs text-amber-600 font-semibold">ادمین</span>
                      : <button onClick={() => toggle(user.id)} disabled={togglingId===user.id}
                          className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${user.isActive ? 'bg-primary-500' : 'bg-gray-200'}`}>
                          {togglingId===user.id
                            ? <i className="fa-solid fa-circle-notch fa-spin text-white text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            : <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${user.isActive ? 'right-1' : 'left-1'}`}/>
                          }
                        </button>
                    }
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Pagination */}
      {meta && meta.totalPages>1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}
            className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center disabled:opacity-40">
            <i className="fa-solid fa-chevron-right text-sm"/>
          </button>
          <span className="text-sm text-gray-600 font-medium">{page} / {meta.totalPages}</span>
          <button disabled={page===meta.totalPages} onClick={() => setPage(p=>p+1)}
            className="w-9 h-9 rounded-xl bg-white border border-sage-200 flex items-center justify-center disabled:opacity-40">
            <i className="fa-solid fa-chevron-left text-sm"/>
          </button>
        </div>
      )}
    </div>
  )
}
