// ============================================================
// src/components/agency/AgencyForm.jsx
//
// The form for creating and editing an agency.
//
// KEY CONCEPT: react-hook-form
// Managing form state manually (onChange, value, errors for
// every field) creates a LOT of boilerplate code. react-hook-form
// handles all of that for you.
//
// The 3 main tools from react-hook-form:
// - register()   → connects an input to the form
// - handleSubmit → calls your function only if validation passes
// - formState    → gives you { errors, isSubmitting, etc. }
// ============================================================

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';

const AgencyForm = ({
    onSubmit,
    initialData = null,
    isloading = false,
    onCancel,
}) => {

    // ---- SET UP THE FORM ----
    const {
        register,       // connects inputs to the form
        handleSubmit,       // wraps your submit function with validation
        formState: { errors },      // validation errors for each field
        reset       // resets all fields
    } = useForm({
        defaultValues: {
            // Default values — pre-fills the form when editing
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            gstin: "",
        }
    });

    // When initialData changes (e.g. user clicks Edit on a different agency),
    // reset the form with the new data
    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
        else {
            reset();
        }
    }, [initialData, reset]);

    // ---- FORM SUBMISSION ----
    // handleSubmit only calls this if ALL validations pass
    const onFormSubmit = async (data) => {
        onSubmit(data);
    }

    return (
        // noValidate disables browser's built-in validation
        // (we use our own, which looks better)
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            {/* ---- ROW 1: Agency Name ---- */}
            <Input
                label="Agency Name"
                required
                placeholder="Enter agency name"
                error={errors.name?.message}
                {...register("name", {
                    required: "Agency name is required",
                    minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters"
                    },
                    maxLength: {
                        value: 100,
                        message: "Name cannot exceed 100 characters"
                    }
                })}
            />

            {/* ---- ROW 2: Contact Person ---- */}
            <Input
                label="Contact Person"
                required
                placeholder="e.g. Ravi Kumar"
                error={errors.contactPerson?.message}
                {...register("contactPerson", {
                    required: "Contact person is required",
                    minLength: {
                        value: 2,
                        message: "Contact person must be at least 2 characters"
                    }
                })}
            />

            {/* ---- ROW 3: Phone + Email (side by side on larger screens) ---- */}
            <div className='form-row'>
                <input
                    label="Phone Number"
                    required
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    error={errors.phone?.message}

                    {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'Enter a valid 10-digit Indian mobile number'
                        }
                    })}
                />

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. john.doe@example.com"
                    error={errors.email?.message}
                    hint="Optional"
                    {...register("email", {
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+.[^\s@]+$/,
                            message: "Enter a valid email address"
                        }
                    })}
                />
            </div>

            {/* ---- ROW 4: Address ---- */}
            <div className='form-group'>
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                    id="address"
                    className="form-textarea"
                    placeholder="Street, City, State, PIN"
                    rows={3}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                    {...register('address')}
                />
                {errors.address && (
                    <p id="address-error" className="form-error" role="alert">
                        {errors.address.message}
                    </p>
                )}
            </div>

            {/* ---- ROW 5: GSTIN ---- */}
            <Input
                label="GSTIN"
                placeholder="e.g. 22AAAAA0000A1Z5"
                hint="15-character GST Identification Number (optional)"
                error={errors.gstin?.message}
                // {...register('gstin', {
                //     pattern: {
                //         value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                //         message: 'Enter a valid GSTIN (e.g. 29ABCDE1234F1Z5)'
                //     }
                // })}
            />

            {/* ---- FORM ACTIONS ---- */}
            <div className='form-actions'>
                <Button
                    type = "button"
                    variant = "secondary"
                    onClick = {onCancel}
                    disabled = {isloading}
                >
                    Cancel
                </Button>

                <Button
                    type = "submit"
                    variant = "primary"
                    isloading = {isloading}
                >
                    {initialData ? "Update Agency" : "Create Agency"}
                </Button>
            </div>
        </form>
    );
}

export default AgencyForm;