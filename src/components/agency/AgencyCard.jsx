import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, CreditCard, User, Pencil, Trash2, ChevronRight } from 'lucide-react';

const AgencyCard = ({ agency, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const initial  = agency.name?.charAt(0).toUpperCase() || '?';

    return (
        <article
            className="agency-card agency-card--clickable animate-fade-in"
            onClick={() => navigate(`/agencies/${agency.id}/bills`)}
            role="button" tabIndex={0}
            aria-label={`Open bills for ${agency.name}`}
            onKeyDown={e => e.key === 'Enter' && navigate(`/agencies/${agency.id}/bills`)}
        >
            <div className="agency-card__header">
                <div className="agency-card__identity">
                    <div className="agency-card__avatar" aria-hidden="true">{initial}</div>
                    <div>
                        <h3 className="agency-card__name">{agency.name}</h3>
                        {agency.totalDue > 0 && (
                            <span className="badge badge--warning">₹{agency.totalDue?.toLocaleString('en-IN')} due</span>
                        )}
                    </div>
                </div>
                <div className="agency-card__actions" onClick={e => e.stopPropagation()}>
                    <button className="icon-btn icon-btn--edit"
                            onClick={e => { e.stopPropagation(); onEdit(agency); }}
                            aria-label={`Edit ${agency.name}`} title="Edit"><Pencil size={16} /></button>
                    <button className="icon-btn icon-btn--delete"
                            onClick={e => { e.stopPropagation(); onDelete(agency); }}
                            aria-label={`Delete ${agency.name}`} title="Delete"><Trash2 size={16} /></button>
                </div>
            </div>

            <dl className="agency-card__details">
                {agency.contactPerson && <div className="agency-card__detail-item"><dt className="sr-only">Contact</dt><dd><User size={14} aria-hidden="true" /><span>{agency.contactPerson}</span></dd></div>}
                {agency.phone && <div className="agency-card__detail-item"><dt className="sr-only">Phone</dt><dd><Phone size={14} aria-hidden="true" /><a href={`tel:${agency.phone}`} className="agency-card__link" onClick={e=>e.stopPropagation()}>{agency.phone}</a></dd></div>}
                {agency.email && <div className="agency-card__detail-item"><dt className="sr-only">Email</dt><dd><Mail size={14} aria-hidden="true" /><a href={`mailto:${agency.email}`} className="agency-card__link" onClick={e=>e.stopPropagation()}>{agency.email}</a></dd></div>}
                {agency.address && <div className="agency-card__detail-item"><dt className="sr-only">Address</dt><dd><MapPin size={14} aria-hidden="true" /><span>{agency.address}</span></dd></div>}
                {agency.gstin && <div className="agency-card__detail-item"><dt className="sr-only">GSTIN</dt><dd><CreditCard size={14} aria-hidden="true" /><span className="agency-card__mono">{agency.gstin}</span></dd></div>}
            </dl>

            <div className="agency-card__cta">
                <span>View bills</span>
                <ChevronRight size={14} aria-hidden="true" />
            </div>
        </article>
    );
};

export default AgencyCard;