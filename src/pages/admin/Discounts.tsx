import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { adminAPI } from '@/services/api'
import { formatPrice } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function AdminDiscounts() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<number|null>(null)
  const [form, setForm] = useState({
    code: '', type: 'PERCENT', value: '',
    minOrder: '', maxUses: '', maxDiscount: '', expiresAt: ''
  })

  const { data, isLoading } = useQuery('admin-discounts', () => adminAPI.discounts())
  const codes = data?.data?.data || []

  const resetForm = () => setForm({ code:'', type:'PERCENT', value:'', minOrder:'', maxUses:'', maxDiscount:'', expiresAt:'' })

  const save = async () => {
    if (!form.code.trim() || !form.value) { toast.error('کد و مقدار تخفیف الزامی است'); return }
    setSaving(true)
    try {
      await adminAPI.createDiscount({
        code:  form.code.toUpperCase(),
        type:  form.type,
        value: parseInt(form.value),
        ...(form.minOrder    && { minOrder:    parseInt(form.minOrder)    }),
        ...(form.maxUses     && { maxUses:     parseInt(form.maxUses)     }),
        ...(form.maxDiscount && { maxDiscount: parseInt(form.maxDiscount) }),
        ...(form.expiresAt   && { expiresAt:   new Date(form.expiresAt)   }),
      })
      qc.invalidateQueries('admin-discounts')
      setShowForm(false)
      resetForm()
      toast.success('کد تخفیف ایجاد شد')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کد')
    } finally { setSaving(false) }
  }

  const toggle = async (id: number) => {
    setTogglingId(id)
    try {
      await adminAPI.toggleDiscount(id)
      qc.invalidateQueries('admin-discounts')
      toast.success('وضعیت کد تغییر کرد')
    } catch { toast.error('خطا') }
    finally { setTogglingId(null) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">کدهای تخفیف</h1>
          <p className="text-xs text-gray-400 mt-0.5">{codes.length} کد تخفیف</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
          <i className="fa-solid fa-plus text-xs"/>افزودن
        </button>
      </div>

      {/* Codes grid - 1 col mobile, 2 col desktop */}
      <div className="grid sm:grid-cols-2 gap-3">
        {isLoading
          ? [...Array(3)].map((_,i) => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse"/>)
          : codes.map((code: any) => (
            <div key={code.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-opacity ${!code.isActive ? 'opacity-60' : 'border-sage-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-widest text-gray-800" dir="ltr">{code.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {code.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {code.type==='PERCENT' ? `${code.value}٪ تخفیف` : `${formatPrice(code.value)} تخفیف ثابت`}
                  </p>
                </div>
                <button onClick={() => toggle(code.id)} disabled={togglingId===code.id}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 ${code.isActive ? 'bg-primary-500' : 'bg-gray-200'}`}>
                  {togglingId===code.id
                    ? <i className="fa-solid fa-circle-notch fa-spin text-white text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                    : <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${code.isActive ? 'right-1' : 'left-1'}`}/>
                  }
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'استفاده',      value: `${code.usedCount}${code.maxUses ? `/${code.maxUses}` : ''}` },
                  { label:'حداقل خرید',   value: code.minOrder>0 ? formatPrice(code.minOrder) : 'ندارد' },
                  { label:'سقف تخفیف',   value: code.maxDiscount ? formatPrice(code.maxDiscount) : '—' },
                ].map(s => (
                  <div key={s.label} className="bg-sage-50 rounded-xl p-2 text-center">
                    <p className="text-[9px] text-gray-400 mb-0.5">{s.label}</p>
                    <p className="text-[10px] font-bold text-gray-700 leading-tight">{s.value}</p>
                  </div>
                ))}
              </div>

              {code.expiresAt && (
                <p className="text-[10px] text-gray-400 mt-2.5 text-center">
                  <i className="fa-regular fa-clock ml-1"/>
                  انقضا: {new Date(code.expiresAt).toLocaleDateString('fa-IR')}
                </p>
              )}
            </div>
          ))
        }
      </div>

      {/* Create form - bottom sheet mobile / modal desktop */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => { setShowForm(false); resetForm() }}/>
          <div className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 left-0 right-0 sm:w-[480px] sm:rounded-3xl bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100 flex-shrink-0">
              <h3 className="font-bold text-gray-800">کد تخفیف جدید</h3>
              <button onClick={() => { setShowForm(false); resetForm() }} className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center hover:bg-sage-200 transition-colors">
                <i className="fa-solid fa-xmark text-gray-600"/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">کد تخفیف *</label>
                <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))}
                  className="input-field text-sm font-bold tracking-widest" placeholder="WELCOME20" dir="ltr"/>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">نوع تخفیف *</label>
                <div className="flex gap-3">
                  {[{v:'PERCENT',l:'درصدی'},{v:'FIXED',l:'مبلغ ثابت'}].map(opt => (
                    <label key={opt.v} onClick={() => setForm(f=>({...f,type:opt.v}))}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.type===opt.v ? 'border-primary-500 bg-primary-50' : 'border-sage-200'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.type===opt.v ? 'border-primary-500' : 'border-gray-300'}`}>
                        {form.type===opt.v && <div className="w-2 h-2 rounded-full bg-primary-500"/>}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{opt.l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">
                    {form.type==='PERCENT' ? 'درصد *' : 'مبلغ (تومان) *'}
                  </label>
                  <input value={form.value} onChange={e => setForm(f=>({...f,value:e.target.value}))}
                    type="number" className="input-field text-sm"
                    placeholder={form.type==='PERCENT' ? '20' : '50000'} dir="ltr"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">حداکثر استفاده</label>
                  <input value={form.maxUses} onChange={e => setForm(f=>({...f,maxUses:e.target.value}))}
                    type="number" className="input-field text-sm" placeholder="100" dir="ltr"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">حداقل خرید (تومان)</label>
                  <input value={form.minOrder} onChange={e => setForm(f=>({...f,minOrder:e.target.value}))}
                    type="number" className="input-field text-sm" placeholder="500000" dir="ltr"/>
                </div>
                {form.type==='PERCENT' && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">سقف تخفیف (تومان)</label>
                    <input value={form.maxDiscount} onChange={e => setForm(f=>({...f,maxDiscount:e.target.value}))}
                      type="number" className="input-field text-sm" placeholder="200000" dir="ltr"/>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">تاریخ انقضا (اختیاری)</label>
                <input value={form.expiresAt} onChange={e => setForm(f=>({...f,expiresAt:e.target.value}))}
                  type="date" className="input-field text-sm" dir="ltr"/>
              </div>
            </div>

            <div className="p-4 border-t border-sage-100 flex-shrink-0">
              <button onClick={save} disabled={saving}
                className="btn-primary w-full py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2">
                {saving ? <i className="fa-solid fa-circle-notch fa-spin"/> : <i className="fa-solid fa-ticket"/>}
                ایجاد کد تخفیف
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
