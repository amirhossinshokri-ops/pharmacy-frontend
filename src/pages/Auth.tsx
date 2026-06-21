import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function Login() {
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !pass) { toast.error('لطفاً تمام فیلدها را پر کنید'); return }
    setLoading(true)
    try {
      await login(email, pass)
      toast.success('خوش آمدید!')
      nav('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ایمیل یا رمز عبور اشتباه است')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
            <i className="fa-solid fa-leaf text-2xl text-white"/>
          </div>
          <h1 className="text-2xl font-black text-primary-700">سلامتی‌شاپ</h1>
          <p className="text-gray-500 text-sm mt-1">ورود به حساب کاربری</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">ایمیل</label>
            <div className="relative">
              <i className="fa-regular fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="example@email.com" className="input-field pr-10" dir="ltr"/>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">رمز عبور</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
              <input value={pass} onChange={e => setPass(e.target.value)} type={show ? 'text' : 'password'}
                placeholder="رمز عبور" className="input-field pr-10 pl-10" dir="ltr"/>
              <button type="button" onClick={() => setShow(!show)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                <i className={`fa-regular fa-${show ? 'eye-slash' : 'eye'}`}/>
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2">
            {loading && <i className="fa-solid fa-circle-notch fa-spin"/>}
            ورود به حساب
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          حساب کاربری ندارید؟{' '}
          <Link to="/register" className="text-primary-600 font-semibold">ثبت‌نام کنید</Link>
        </p>

        {/* test accounts hint */}
        <div className="mt-4 bg-sage-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600">حساب‌های آزمایشی:</p>
          <p>ادمین: admin@salamatishop.ir / Admin@123</p>
          <p>کاربر: test@example.com / Test@1234</p>
        </div>
      </div>
    </div>
  )
}

export function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: ''
  })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('لطفاً فیلدهای ستاره‌دار را پر کنید'); return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('رمز عبور و تکرار آن یکسان نیستند'); return
    }
    if (form.password.length < 8) {
      toast.error('رمز عبور حداقل ۸ کاراکتر باشد'); return
    }
    if (!/[A-Z]/.test(form.password)) {
      toast.error('رمز عبور باید حداقل یک حرف بزرگ داشته باشد (مثال: Test@1234)'); return
    }
    if (!/[0-9]/.test(form.password)) {
      toast.error('رمز عبور باید حداقل یک عدد داشته باشد'); return
    }
    setLoading(true)
    try {
      await authAPI.register(form)
      await login(form.email, form.password)
      toast.success('ثبت‌نام با موفقیت انجام شد!')
      nav('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ثبت‌نام')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
            <i className="fa-solid fa-leaf text-2xl text-white"/>
          </div>
          <h1 className="text-2xl font-black text-primary-700">ثبت‌نام</h1>
          <p className="text-gray-500 text-sm mt-1">ساخت حساب جدید</p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">نام *</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="نام" className="input-field text-sm"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">نام خانوادگی *</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                placeholder="فامیلی" className="input-field text-sm"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">ایمیل *</label>
            <input value={form.email} onChange={e => set('email', e.target.value)}
              type="email" placeholder="example@email.com" className="input-field text-sm" dir="ltr"/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">شماره موبایل</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="09123456789" className="input-field text-sm" dir="ltr"/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">رمز عبور * <span className="text-gray-400 font-normal">(مثال: Test@1234)</span></label>
            <div className="relative">
              <input value={form.password} onChange={e => set('password', e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="حداقل ۸ کاراکتر، یک حرف بزرگ و یک عدد"
                className="input-field text-sm pl-10" dir="ltr"/>
              <button type="button" onClick={() => setShow(!show)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                <i className={`fa-regular fa-${show ? 'eye-slash' : 'eye'}`}/>
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">تکرار رمز عبور *</label>
            <input value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
              type="password" placeholder="رمز عبور را تکرار کنید"
              className="input-field text-sm" dir="ltr"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 mt-2">
            {loading && <i className="fa-solid fa-circle-notch fa-spin"/>}
            ثبت‌نام
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          حساب دارید؟{' '}
          <Link to="/login" className="text-primary-600 font-semibold">وارد شوید</Link>
        </p>
      </div>
    </div>
  )
}
