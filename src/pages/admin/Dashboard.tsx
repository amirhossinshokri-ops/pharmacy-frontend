import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { adminAPI } from '@/services/api'
import { formatPrice, orderStatusLabel, orderStatusColor } from '@/utils/helpers'
import { PageLoader } from '@/components/ui/Loading'

const STAT_CARDS = [
  { key:'totalRevenue',      label:'درآمد کل',       icon:'fa-sack-dollar',        bg:'bg-emerald-100', color:'text-emerald-700', currency:true  },
  { key:'totalOrders',       label:'سفارشات',         icon:'fa-box',                bg:'bg-blue-100',    color:'text-blue-700',    currency:false },
  { key:'totalUsers',        label:'کاربران',          icon:'fa-users',              bg:'bg-violet-100',  color:'text-violet-700',  currency:false },
  { key:'totalProducts',     label:'محصولات فعال',    icon:'fa-tag',                bg:'bg-amber-100',   color:'text-amber-700',   currency:false },
]

export default function AdminDashboard() {
  const { data, isLoading } = useQuery('admin-stats', adminAPI.stats, { refetchInterval: 60000 })
  if (isLoading) return <PageLoader/>

  const stats = data?.data?.data
  if (!stats) return null
  const { overview, recentOrders, topProducts, ordersByStatus } = stats
  const totalForStatus = ordersByStatus.reduce((s: number, o: any) => s + o.count, 0)

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">داشبورد</h1>
        <p className="text-xs text-gray-400 mt-0.5">خلاصه عملکرد فروشگاه</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map(card=>(
          <div key={card.key} className="bg-white rounded-2xl p-4 border border-sage-100 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <i className={`fa-solid ${card.icon} ${card.color}`}/>
            </div>
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className="text-lg font-black text-gray-800 leading-tight">
              {card.currency ? formatPrice(overview[card.key]) : (overview[card.key]||0).toLocaleString('fa-IR')}
            </p>
            {card.key==='totalUsers' && (
              <p className="text-[10px] text-green-600 mt-1 font-medium">+{overview.newUsersThisMonth} این ماه</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">وضعیت سفارشات</h3>
          <div className="space-y-3">
            {ordersByStatus.map((s: any)=>{
              const pct = totalForStatus>0 ? Math.round((s.count/totalForStatus)*100) : 0
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-bold px-2 py-0.5 rounded-full ${orderStatusColor[s.status]}`}>{orderStatusLabel[s.status]}</span>
                    <span className="text-gray-500">{s.count} ({pct}٪)</span>
                  </div>
                  <div className="h-1.5 bg-sage-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{width:`${pct}%`}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">پرفروش‌ترین محصولات</h3>
            <Link to="/admin/products" className="text-xs text-primary-600 font-medium">مشاهده همه</Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((p: any, i: number)=>(
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-gray-300">#{i+1}</span>
                <img src={p.images?.[0]||'https://placehold.co/40x40/e6ede9/0e7f5c?text=.'}
                  onError={e=>{(e.target as any).src='https://placehold.co/40x40/e6ede9/0e7f5c?text=.'}}
                  className="w-10 h-10 rounded-xl object-cover bg-sage-100 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{(p.salesCount||0).toLocaleString('fa-IR')} فروش</p>
                </div>
                <p className="text-xs font-bold text-primary-600 flex-shrink-0">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-sm">آخرین سفارشات</h3>
          <Link to="/admin/orders" className="text-xs text-primary-600 font-medium">مشاهده همه</Link>
        </div>
        <div className="space-y-2.5">
          {recentOrders.map((order: any)=>(
            <div key={order.id} className="flex items-center gap-3 bg-sage-50 rounded-xl p-2.5">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <i className="fa-solid fa-box text-primary-400 text-sm"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">{order.user?.firstName} {order.user?.lastName}</p>
                <p className="text-[10px] text-gray-400">سفارش #{order.id}</p>
              </div>
              <div className="text-left flex-shrink-0">
                <p className="text-xs font-bold text-gray-800">{formatPrice(order.finalPrice)}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${orderStatusColor[order.status]}`}>
                  {orderStatusLabel[order.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
