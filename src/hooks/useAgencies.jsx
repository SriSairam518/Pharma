
import { useState, useEffect, useCallback } from "react";
import { agencyApi } from "../services/api";
import toast from 'react-hot-toast';

const useAgencies = () => {

    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchAgencies = useCallback(async () => {
        setLoading(true);
        setError(null);

        try{
            const response = await agencyApi.getAll();
            setAgencies(response.data.data || []);
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Failed to load agencies";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgencies();
    }, [fetchAgencies]);

    const createAgency = async (agencyData) => {
        setSubmitting(true);
        try{
            const response = await agencyApi.create(agencyData);
            const newAgency = response.data.data;
            setAgencies(prev => [newAgency, ...prev]);
            toast.success(`Agency "${newAgency.name}" created successfully!`);
            return { success: true};
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create agency';
            toast.error(message);
            return { success: false, error: message};
        } finally {
            setSubmitting(false);
        }
    }

    const updateAgency = async (id, agencyData) => {
        setSubmitting(true);
        try{
            const response = await agencyApi.update(id, agencyData);
            const updatedAgency = response.data.data;
            setAgencies(prev => 
                prev.map(agency => 
                    agency.id === id ? updatedAgency: agency
                )
            );
            toast.success(`Agency "${updatedAgency.name}" updated successfully!`);
            return { success: true};
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update agency';
            toast.error(message);
            return { success: false, error: message};
        } finally {
            setSubmitting(false);
        }
    }

    const deleteAgency = async (id, name) => {
        setSubmitting(true);
        try{
            await agencyApi.delete(id);
            setAgencies(prev => 
                prev.filter(agency => agency.id !== id)
            );
            toast.success(`Agency ${name} deleted successfully!`);
            return { success: true};
        } catch (err){
            const message = err.response?.data?.message || 'Failed to delete agency';
            toast.error(message);
            return { success: false, error: message};
        } finally {
            setSubmitting(false);
        }
    }

    return {
        agencies,
        loading,
        error,
        submitting,
        fetchAgencies,
        createAgency,
        updateAgency,
        deleteAgency
    };
};

export default useAgencies;