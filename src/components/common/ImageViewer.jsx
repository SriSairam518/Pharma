
import { useEffect } from 'react';
import { X, ExternalLink, ZoomIn } from 'lucide-react';

const ImageViewer = ({ isOpen, onClose, imageUrl, title = 'Image' }) => {

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen || !imageUrl) return null;

    return (
        <div
            className="image-viewer__backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`Viewing: ${title}`}
        >
            <div className="image-viewer__toolbar" onClick={e => e.stopPropagation()}>
                <span className="image-viewer__title">{title}</span>
                <div className="image-viewer__actions">
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="image-viewer__btn"
                        title="Open in new tab"
                        aria-label="Open image in new tab"
                    >
                        <ExternalLink size={18} />
                    </a>
                    <button
                        className="image-viewer__btn"
                        onClick={onClose}
                        aria-label="Close image viewer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div
                className="image-viewer__content"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt={title}
                    className="image-viewer__img"
                />
            </div>

            <p className="image-viewer__hint">Click outside or press Esc to close</p>
        </div>
    );
};

export default ImageViewer;