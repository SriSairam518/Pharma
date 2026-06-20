// ============================================================
// src/pages/AgenciesPage.jsx
//
// The main Agency Management page.
//
// THIS IS THE "ORCHESTRATOR" — it:
// 1. Uses the useAgencies hook to get data + actions
// 2. Manages UI state (which modal is open, which agency is selected)
// 3. Renders the list of AgencyCards
// 4. Opens the form modal for create/edit
// 5. Opens the confirm dialog for delete
//
// Think of it like a manager: it delegates work to
// specialized components and coordinates between them.
// ============================================================

import { useState } from 'react';
import { Plus, Building2, RefreshCw, Search } from 'lucide-react';
import useAgencies from '../hooks/useAgencies';
import AgencyCard from '../components/agency/AgencyCard';
import AgencyForm from '../components/agency/AgencyForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/Confirmdialog.jsx';
import Button from '../components/common/Button';

const AgenciesPage = () => {

    // ---- DATA & ACTIONS from our custom hook ----
    const {
        agencies,
        loading,
        error,
        submitting,
        fetchAgencies,
        createAgency,
        updateAgency,
        deleteAgency,
    } = useAgencies();

    // ---- UI STATE ----
    // These control which modals are visible and which agency is selected
    const [isFormOpen, setIsFormOpen]         = useState(false);
    const [isDeleteOpen, setIsDeleteOpen]     = useState(false);
    const [selectedAgency, setSelectedAgency] = useState(null); // agency being edited/deleted
    const [searchQuery, setSearchQuery]       = useState('');

    // ---- HANDLERS ----

    // Open the "Add Agency" form (no selected agency = create mode)
    const handleAddClick = () => {
        setSelectedAgency(null);   // clear any previously selected agency
        setIsFormOpen(true);
    };

    // Open the "Edit Agency" form with the selected agency's data
    const handleEditClick = (agency) => {
        setSelectedAgency(agency);
        setIsFormOpen(true);
    };

    // Open the delete confirmation dialog
    const handleDeleteClick = (agency) => {
        setSelectedAgency(agency);
        setIsDeleteOpen(true);
    };

    // Called when the form is submitted (create or update)
    const handleFormSubmit = async (formData) => {
        let result;
        if (selectedAgency) {
            // Edit mode — pass the existing agency's ID
            result = await updateAgency(selectedAgency.id, formData);
        } else {
            // Create mode
            result = await createAgency(formData);
        }
        // Only close the modal if the operation succeeded
        if (result.success) setIsFormOpen(false);
    };

    // Called when delete is confirmed
    const handleDeleteConfirm = async () => {
        const result = await deleteAgency(selectedAgency.id, selectedAgency.name);
        if (result.success) setIsDeleteOpen(false);
    };

    // ---- SEARCH FILTERING ----
    // Filter agencies client-side based on search input.
    // For a real app with thousands of records, you'd do this
    // on the backend. For a medical shop (< 100 agencies), this is fine.

    const filteredAgencies = agencies.filter(agency => {
            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase();

            return (
                agency.name?.toLowerCase().includes(q) ||
                agency.contactPerson?.toLowerCase().includes(q) ||
                agency.phone?.includes(q) ||
                agency.email?.toLowerCase().includes(q)
            );
        });

    // ---- RENDER ----
    return (
        <div className="page">

            {/* ---- Page Header ---- */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Agencies</h1>
                    <p className="page-subtitle">
                        {agencies.length > 0
                            ? `${agencies.length} supplier${agencies.length !== 1 ? 's' : ''} registered`
                            : 'Manage your medicine suppliers'
                        }
                    </p>
                </div>

                {/* Header actions */}
                <div className="page-header__actions">
                    {/* Refresh button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchAgencies}
                        loading={loading}
                        aria-label="Refresh agencies list"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </Button>

                    {/* Add Agency button */}
                    <Button
                        variant="primary"
                        onClick={handleAddClick}
                    >
                        <Plus size={18} aria-hidden="true" />
                        Add agency
                    </Button>
                </div>
            </div>

            {/* ---- Search Bar ---- */}
            {agencies.length > 0 && (
                <div className="search-bar">
                    <Search size={16} className="search-bar__icon" aria-hidden="true" />
                    <input
                        type="search"
                        className="search-bar__input"
                        placeholder="Search by name, contact, phone or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search agencies"
                    />
                </div>
            )}

            {/* ---- Main Content Area ---- */}
            <div className="page-content">

                {/* LOADING STATE */}
                {loading && agencies.length === 0 && (
                    <div className="state-container">
                        <div className="loading-grid" aria-label="Loading agencies...">
                            {/* Skeleton cards while loading */}
                            {[1,2,3].map(n => (
                                <div key={n} className="skeleton-card" aria-hidden="true">
                                    <div className="skeleton skeleton--title" />
                                    <div className="skeleton skeleton--text" />
                                    <div className="skeleton skeleton--text skeleton--short" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ERROR STATE */}
                {error && !loading && (
                    <div className="state-container" role="alert">
                        <div className="state-box state-box--error">
                            <p className="state-box__message">{error}</p>
                            <Button variant="secondary" size="sm" onClick={fetchAgencies}>
                                Try again
                            </Button>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE — no agencies at all */}
                {!loading && !error && agencies.length === 0 && (
                    <div className="state-container">
                        <div className="empty-state">
                            <div className="empty-state__icon" aria-hidden="true">
                                <Building2 size={40} />
                            </div>
                            <h2 className="empty-state__title">No agencies yet</h2>
                            <p className="empty-state__description">
                                Add your first medicine supplier to get started.
                            </p>
                            <Button variant="primary" onClick={handleAddClick}>
                                <Plus size={18} aria-hidden="true" />
                                Add your first agency
                            </Button>
                        </div>
                    </div>
                )}

                {/* EMPTY SEARCH RESULTS */}
                {!loading && agencies.length > 0 && filteredAgencies.length === 0 && (
                    <div className="state-container">
                        <div className="empty-state">
                            <div className="empty-state__icon" aria-hidden="true">
                                <Search size={40} />
                            </div>
                            <h2 className="empty-state__title">No results found</h2>
                            <p className="empty-state__description">
                                No agencies match "<strong>{searchQuery}</strong>".
                            </p>
                            <Button variant="ghost" onClick={() => setSearchQuery('')}>
                                Clear search
                            </Button>
                        </div>
                    </div>
                )}

                {/* AGENCIES GRID */}
                {filteredAgencies.length > 0 && (
                    <div
                        className="agency-grid"
                        role="list"
                        aria-label="Agencies list"
                    >
                        {filteredAgencies.map(agency => (
                            <div role="listitem" key={agency.id}>
                                <AgencyCard
                                    agency={agency}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ---- CREATE / EDIT MODAL ---- */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={selectedAgency ? 'Edit agency' : 'Add new agency'}
                size="md"
            >
                <AgencyForm
                    initialData={selectedAgency}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isloading={submitting}
                />
            </Modal>

            {/* ---- DELETE CONFIRMATION MODAL ---- */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete agency?"
                message={`Are you sure you want to delete "${selectedAgency?.name}"? This will also remove all associated bills and records. This cannot be undone.`}
                confirmLabel="Yes, delete"
                isloading={submitting}
            />

        </div>
    );
};

export default AgenciesPage;