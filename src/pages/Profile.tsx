import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { orderAPI, authAPI } from '@/services/api'
import { formatPrice, orderStatusLabel, orderStatusColor } from '@/utils/helpers'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout, isLoggedIn, refresh } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState<'orders'|'settings'>('orders')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', phone: user?.phone||'' })
  const [saving, setSaving] = useState(false)
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [changingPass, setChangingPass] = useState(false)

  const { data: ordersData, isLoading } = useQuery('my-orders', () => orderAPI.list(), { enabled: isLoggedIn })
  const orders = ordersData?.data?.data || []

  if (!isLoggedIn) return (
    <div className="pb-24 pt-4">
      <EmptyState icon="fa-user" title="لطفاً وارد شوید" action={{ label:'ورود به حساب', to:'/login' }}/>
    </div>
  )

  const handleLogout = async () => { await logout(); nav('/'); toast.success('خارج شدید') }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await authAPI.updateProfile(form)
      await refresh()
      setEditing(false)
      toast.success('پروفایل بروزرسانی شد')
    } catch (err: any) { toast.error(err.response?.data?.message||'خطا') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!passForm.currentPassword||!passForm.newPassword) { toast.error('رمزها را وارد کنید'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('رمز جدید و تکرار آن یکسان نیستند'); return }
    setChangingPass(true)
    try {
      await authAPI.changePassword(passForm)
      setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
      toast.success('رمز عبور تغییر کرد')
    } catch (err: any) { toast.error(err.response?.data?.message||'خطا در تغییر رمز') }
    finally { setChangingPass(false) }
  }

  return (
    <div className="pb-20 sm:pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary-700 to-primary-600 px-4 pt-6 pb-16">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 flex-shrink-0">
              {user?.avatar
                ? <img src={user.avatar} className="w-full h-full object-cover"/>
                : <div className="w-full h-full bg-white/20 flex items-center justify-center text-2xl font-black text-white">{user?.firstName?.[0]}</div>
              }
            </div>
            <div>
              <p className="text-white font-bold text-lg">{user?.firstName} {user?.lastName}</p>
              <p className="text-white/70 text-xs mt-0.5">{user?.email}</p>
              {user?.role==='ADMIN' && (
                <span className="inline-block bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">ادمین</span>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 flex-shrink-0">
            <i className="fa-solid fa-arrow-right-from-bracket"/>خروج
          </button>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 mt-5">
          {[
            { label:'سفارشات',    value: user?._count?.orders||0,        icon:'fa-box'  },
            { label:'علاقه‌مندی', value: user?._count?.wishlistItems||0, icon:'fa-heart'},
            { label:'نظرات',      value: user?._count?.reviews||0,        icon:'fa-star' },
          ].map(s=>(
            <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center">
              <i className={`fa-solid ${s.icon} text-white/80 text-lg mb-1`}/>
              <p className="text-white font-black text-lg">{s.value}</p>
              <p className="text-white/70 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Admin link */}
        {user?.role==='ADMIN' && (
          <div className="-mt-5 mb-3 relative z-10">
            <Link to="/admin" className="block bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-4 py-3 text-sm font-bold flex items-center gap-3 shadow-lg shadow-amber-200 transition-colors">
              <i className="fa-solid fa-chart-line text-lg"/>
              <span>ورود به پنل مدیریت</span>
              <i className="fa-solid fa-chevron-left mr-auto text-xs"/>
            </Link>
          </div>
        )}

        {/* Card */}
        <div className={`bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden ${user?.role!=='ADMIN'?'-mt-8 relative z-10':''}`}>
          <div className="flex border-b border-sage-100">
            {(['orders','settings'] as const).map((t,i)=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab===t?'text-primary-600 border-b-2 border-primary-500':'text-gray-400'}`}>
                <i className={`fa-solid ${['fa-box','fa-gear'][i]} ml-2`}/>
                {['سفارشات','تنظیمات'][i]}
              </button>
            ))}
          </div>

          {/* Orders tab */}
          {tab==='orders' && (
            <div>
              {isLoading
                ? <div className="p-4 space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-24 bg-sage-50 rounded-xl animate-pulse"/>)}</div>
                : orders.length===0
                  ? <div className="py-12 text-center"><i className="fa-solid fa-box-open text-4xl text-gray-200 mb-3"/><p className="text-sm text-gray-400">هنوز سفارشی ثبت نکرده‌اید</p><Link to="/products" className="inline-block mt-3 text-sm text-primary-600 font-medium">شروع خرید</Link></div>
                  : <div className="divide-y divide-sage-50">
                    {orders.map((order: any)=>(
                      <div key={order.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-600">سفارش #{order.id}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${orderStatusColor[order.status]}`}>
                            {orderStatusLabel[order.status]}
                          </span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {order.items?.slice(0,4).map((item: any)=>(
                            <img key={item.id}
                              src={item.product?.images?.[0]||'https://placehold.co/40x40/e6ede9/0e7f5c?text=.'}
                              onError={e=>{(e.target as any).src='https://placehold.co/40x40/e6ede9/0e7f5c?text=.'}}
                              className="w-10 h-10 rounded-xl object-cover bg-sage-100"/>
                          ))}
                          {order.items?.length>4 && (
                            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                              +{order.items.length-4}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-primary-600">{formatPrice(order.finalPrice)}</span>
                          <span className="text-[10px] text-gray-400">{order.items?.length} کالا</span>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* Settings tab */}
          {tab==='settings' && (
            <div className="p-4 space-y-5">
              {/* Edit profile */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">اطلاعات شخصی</p>
                  {!editing && <button onClick={()=>setEditing(true)} className="text-xs text-primary-600 font-medium">ویرایش</button>}
                </div>
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} placeholder="نام" className="input-field text-sm"/>
                      <input value={form.lastName}  onChange={e=>setForm(f=>({...f,lastName:e.target.value}))}  placeholder="نام خانوادگی" className="input-field text-sm"/>
                    </div>
                    <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="شماره موبایل" className="input-field text-sm" dir="ltr"/>
                    <div className="flex gap-2">
                      <button onClick={()=>setEditing(false)} className="btn-outline flex-1 py-2.5 rounded-xl text-sm">لغو</button>
                      <button onClick={saveProfile} disabled={saving} className="btn-primary flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-1">
                        {saving&&<i className="fa-solid fa-circle-notch fa-spin text-xs"/>}ذخیره
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-sage-50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">نام</span><span className="font-medium">{user?.firstName} {user?.lastName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">ایمیل</span><span className="font-medium text-xs" dir="ltr">{user?.email}</span></div>
                    {user?.phone && <div className="flex justify-between text-sm"><span className="text-gray-500">موبایل</span><span className="font-medium" dir="ltr">{user.phone}</span></div>}
                  </div>
                )}
              </div>

              {/* Change password */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">تغییر رمز عبور</p>
                <div className="space-y-2.5">
                  <input value={passForm.currentPassword} onChange={e=>setPassForm(f=>({...f,currentPassword:e.target.value}))} type="password" placeholder="رمز عبور فعلی" className="input-field text-sm" dir="ltr"/>
                  <input value={passForm.newPassword}     onChange={e=>setPassForm(f=>({...f,newPassword:e.target.value}))}     type="password" placeholder="رمز عبور جدید (مثال: NewPass@1)" className="input-field text-sm" dir="ltr"/>
                  <input value={passForm.confirmPassword} onChange={e=>setPassForm(f=>({...f,confirmPassword:e.target.value}))} type="password" placeholder="تکرار رمز جدید" className="input-field text-sm" dir="ltr"/>
                  <button onClick={changePassword} disabled={changingPass} className="btn-primary w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-1">
                    {changingPass&&<i className="fa-solid fa-circle-notch fa-spin text-xs"/>}تغییر رمز عبور
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
