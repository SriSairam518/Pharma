import { useEffect, useState } from 'react';
import { baseApi } from '../services/api.js'

const DashboardPage = async () => {
    const [message, setMessage] = useState('failed');

    useEffect(() => {
        const fetchData = async () => {
            try{
                const result = await baseApi.base();
                setMessage(result);
            } catch (e) {
                console.error(e);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="page">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{message}</p>
        </div>
    );
}

export default DashboardPage;