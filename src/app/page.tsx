"use client"; // This tells Next.js to treat this as a client component

import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        // Call the API route to set the session token with Authorization header
        fetch('/api/stoken', {
            method: 'GET',
            headers: {
                'Authorization': process.env.NEXT_PUBLIC_PSWD2 || "", // Replace with your token
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => console.log(data.message))
            .catch((error) => console.error('Error setting session token:', error));
    }, []);

    return (
        <>
            {Array.from({ length: 40 }, (_, i) => (
                <div key={i}>hi</div>
            ))}
        </>
    );
}
