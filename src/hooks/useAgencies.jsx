// ============================================================
// src/hooks/useAgencies.js
//
// WHAT IS A CUSTOM HOOK?
// A "hook" in React is a function that manages state and
// side effects (like API calls). A CUSTOM hook is one you
// write yourself to package reusable logic.
//
// ANALOGY: Think of it like a TV remote. The remote (hook)
// hides all the complex wiring (API calls, loading states,
// error handling) and gives you simple buttons to press.
//
// WHY USE A HOOK INSTEAD OF PUTTING THIS IN THE COMPONENT?
// 1. The component stays clean — only handles what to SHOW
// 2. You can reuse this logic in other components
// 3. Easier to test in isolation
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { agencyApi } from "../services/api";
import toast from 'react-hot-toast';

// Custom hook — by convention, hook names always start with "use"
const useAgencies = () => {

    // ---- STATE ----
    // useState gives us a variable + a function to update it.
    // When state updates, React re-renders the component.

    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);


     // ---- FETCH ALL AGENCIES ----
    // useCallback prevents this function from being recreated
    // on every render — a performance optimization.

    const fetchAgencies = useCallback(async () => {
        setLoading(true);
        setError(null);

        try{
            const response = await agencyApi.getAll();
            // Spring Boot wraps data in response.data
            setAgencies(response.data.data || []);
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Failed to load agencies";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect runs after the component mounts (appears on screen).
    // The [] means "run only once" — like componentDidMount in class components.

    useEffect(() => {
        fetchAgencies();
    }, [fetchAgencies]);

    // ---- CREATE AGENCY ----
    const createAgency = async (agencyData) => {
        setSubmitting(true);
        try{
            const response = await agencyApi.create(agencyData);
            const newAgency = response.data.data;
            // Add the new agency to the top of the list without refetching
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

    // ---- UPDATE AGENCY ----
    const updateAgency = async (id, agencyData) => {
        setSubmitting(true);
        try{
            const response = await agencyApi.update(id, agencyData);
            const updatedAgency = response.data.data;
            // Replace the old Agency object with the updated one
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

    // ---- DELETE AGENCY ----
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

    // return everything the component needs to interact with agencies
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