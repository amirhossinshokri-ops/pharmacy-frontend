import { Link } from 'react-router-dom'

interface Props { icon: string; title: string; description?: string; action?: { label: string; to: string } }

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-20 h-20 bg-sage-100 rounded-3xl flex items-center justify-center mb-5 mx-auto">
        <i className={`fa-solid ${icon} text-3xl text-gray-300`}/>
      </div>
      <h3 className="text-gray-700 font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-5">{description}</p>}
      {action && <Link to={action.to} className="btn-primary text-sm">{action.label}</Link>}
    </div>
  )
}
