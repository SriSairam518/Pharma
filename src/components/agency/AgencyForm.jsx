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

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            gstin: "",
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
        else {
            reset();
        }
    }, [initialData, reset]);

    const onFormSubmit = async (data) => {
        onSubmit(data);
    }

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
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

            <Input
                label="GSTIN"
                placeholder="e.g. 22AAAAA0000A1Z5"
                hint="15-character GST Identification Number (optional)"
                error={errors.gstin?.message}
                {...register('gstin', {
                    pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: 'Enter a valid GSTIN (e.g. 29ABCDE1234F1Z5)'
                    }
                })}
            />

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