import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { productAPI, categoryAPI } from '@/services/api'
import { formatPrice, getImageUrl } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [deleting, setDeleting] = useState<number|null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:'', price:'', originalPrice:'', brand:'',
    stock:'', categoryId:'', description:'', howToUse:'', isFeatured: false
  })
  const [files, setFiles] = useState<File[]>([])

  const { data, isLoading } = useQuery(
    ['admin-products', page, search],
    () => productAPI.list({ page, limit: 10, search, sortBy:'createdAt', sortOrder:'desc' }),
    { keepPreviousData: true }
  )
  const { data: catData } = useQuery('categories', () => categoryAPI.list())
  const products   = data?.data?.data || []
  const meta       = data?.data?.meta
  const categories = catData?.data?.data || []

  const openCreate = () => {
    setEditProduct(null)
    setForm({ name:'', price:'', originalPrice:'', brand:'', stock:'', categoryId:'', description:'', howToUse:'', isFeatured:false })
    setFiles([])
    setShowForm(true)
  }

  const openEdit = (p: any) => {
    setEditProduct(p)
    setForm({
      name: p.name, price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      brand: p.brand||'', stock: String(p.stock),
      categoryId: String(p.categoryId), description: p.description||'',
      howToUse: p.howToUse||'', isFeatured: p.isFeatured,
    })
    setFiles([])
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('نام، قیمت و دسته‌بندی الزامی است'); return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k, String(v)))
      files.forEach(f => fd.append('images', f))
      if (editProduct) {
        await productAPI.update(editProduct.id, fd)
        toast.success('محصول بروزرسانی شد')
      } else {
        await productAPI.create(fd)
        toast.success('محصول ایجاد شد')
      }
      qc.invalidateQueries('admin-products')
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ذخیره')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`آیا از حذف "${name}" مطمئن هستید؟`)) return
    setDeleting(id)
    try {
      await productAPI.delete(id)
      qc.invalidateQueries('admin-products')
      toast.success('محصول حذف شد')
    } catch { toast.error('خطا در حذف') }
    finally { setDeleting(null) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">مدیریت محصولات</h1>
          {meta && <p className="text-xs text-gray-400 mt-0.5">{meta.total} محصول</p>}
        </div>
        <button onClick={openCreate} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
          <i className="fa-solid fa-plus text-xs"/>افزودن محصول
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="bg-white border border-sage-200 rounded-2xl px-4 h-11 flex items-center gap-3 focus-within:border-primary-400 transition-colors">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="جستجوی نام، برند، دسته‌بندی..."
            className="bg-transparent outline-none w-full text-sm"/>
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-xmark text-sm"/>
            </button>
          )}
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden sm:grid sm:grid-cols-6 px-4 py-2 text-xs font-semibold text-gray-400 mb-1">
        <span className="col-span-3">محصول</span>
        <span className="text-center">قیمت</span>
        <span className="text-center">موجودی</span>
        <span className="text-center">عملیات</span>
      </div>

      {/* Products list */}
      <div className="space-y-2.5">
        {isLoading
          ? [...Array(5)].map((_,i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse"/>)
          : products.length===0
            ? <div className="text-center py-12 text-gray-400 text-sm">محصولی یافت نشد</div>
            : products.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl border border-sage-100 shadow-sm">
                {/* Mobile */}
                <div className="sm:hidden flex items-center gap-3 p-3">
                  <img src={getImageUrl(p.images?.[0])}
                    onError={e=>{(e.target as any).src='https://placehold.co/56x56/e6ede9/0e7f5c?text=.'}}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-sage-100"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.brand} • موجودی: {p.stock}</p>
                    <p className="text-xs font-bold text-primary-600 mt-0.5">{formatPrice(p.price)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                      <i className="fa-solid fa-pen text-blue-500 text-xs"/>
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting===p.id}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors">
                      {deleting===p.id
                        ? <i className="fa-solid fa-circle-notch fa-spin text-red-400 text-xs"/>
                        : <i className="fa-solid fa-trash text-red-400 text-xs"/>
                      }
                    </button>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden sm:grid sm:grid-cols-6 items-center px-4 py-3 gap-3">
                  <div className="col-span-3 flex items-center gap-3">
                    <img src={getImageUrl(p.images?.[0])}
                      onError={e=>{(e.target as any).src='https://placehold.co/48x48/e6ede9/0e7f5c?text=.'}}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-sage-100"/>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand} • {p.category?.name}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-primary-600 text-center">{formatPrice(p.price)}</p>
                  <p className={`text-xs font-semibold text-center ${p.stock<=p.minStock ? 'text-red-500' : 'text-gray-600'}`}>
                    {p.stock}
                    {p.stock<=p.minStock && <i className="fa-solid fa-triangle-exclamation ml-1 text-[10px]"/>}
                  </p>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                      <i className="fa-solid fa-pen text-blue-500 text-xs"/>
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting===p.id}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors">
                      {deleting===p.id
                        ? <i className="fa-solid fa-circle-notch fa-spin text-red-400 text-xs"/>
                        : <i className="fa-solid fa-trash text-red-400 text-xs"/>
                      }
                    </button>
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

      {/* Form - modal on desktop, bottom sheet on mobile */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setShowForm(false)}/>
          <div className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 left-0 right-0 sm:w-[560px] sm:rounded-3xl bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sage-100 flex-shrink-0">
              <h3 className="font-bold text-gray-800">{editProduct ? 'ویرایش محصول' : 'افزودن محصول'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center hover:bg-sage-200 transition-colors">
                <i className="fa-solid fa-xmark text-gray-600"/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">نام محصول *</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  className="input-field text-sm" placeholder="نام محصول"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">قیمت (تومان) *</label>
                  <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}
                    type="number" className="input-field text-sm" placeholder="690000" dir="ltr"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">قیمت اصلی (تومان)</label>
                  <input value={form.originalPrice} onChange={e=>setForm(f=>({...f,originalPrice:e.target.value}))}
                    type="number" className="input-field text-sm" placeholder="890000" dir="ltr"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">برند</label>
                  <input value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))}
                    className="input-field text-sm" placeholder="نام برند"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">موجودی</label>
                  <input value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}
                    type="number" className="input-field text-sm" placeholder="50" dir="ltr"/>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">دسته‌بندی *</label>
                <select value={form.categoryId} onChange={e=>setForm(f=>({...f,categoryId:e.target.value}))}
                  className="input-field text-sm">
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">توضیحات</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  rows={3} className="input-field text-sm resize-none" placeholder="توضیحات محصول..."/>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">نحوه استفاده</label>
                <textarea value={form.howToUse} onChange={e=>setForm(f=>({...f,howToUse:e.target.value}))}
                  rows={2} className="input-field text-sm resize-none" placeholder="راهنمای استفاده..."/>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">تصاویر</label>
                <label className="flex items-center gap-3 bg-sage-50 border-2 border-dashed border-sage-200 rounded-2xl p-4 cursor-pointer hover:border-primary-300 transition-colors">
                  <i className="fa-solid fa-image text-2xl text-gray-300"/>
                  <div>
                    <p className="text-sm font-medium text-gray-600">انتخاب تصویر</p>
                    <p className="text-xs text-gray-400">
                      {files.length>0 ? `${files.length} فایل انتخاب شده` : 'PNG، JPG، WebP — حداکثر ۵ فایل'}
                    </p>
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
                </label>
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-1">
                <button type="button" onClick={() => setForm(f=>({...f,isFeatured:!f.isFeatured}))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.isFeatured ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isFeatured ? 'right-1' : 'left-1'}`}/>
                </button>
                <span className="text-sm font-medium text-gray-700">محصول ویژه</span>
              </label>
            </div>

            <div className="p-4 border-t border-sage-100 flex-shrink-0 flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3 rounded-2xl text-sm">لغو</button>
              <button onClick={save} disabled={saving}
                className="btn-primary flex-2 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 flex-1">
                {saving ? <i className="fa-solid fa-circle-notch fa-spin"/> : <i className="fa-solid fa-floppy-disk"/>}
                {editProduct ? 'بروزرسانی' : 'ذخیره محصول'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
