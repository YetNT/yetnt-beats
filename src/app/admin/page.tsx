"use client";

import React, { useState } from 'react';
import "./page.css";
import { LICENSES_MAP, TAGS_ARRAY } from '@/beatstypes';

const Admin = () => {
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [unatggedWav, setUnatggedWav] = useState<File | null>(null);
    const [taggedWav, setTaggedWav] = useState<File | null>(null);
    const [taggedMp3, setTaggedMp3] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [bpm, setBpm] = useState('');
    const [price, setPrice] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [licenses, setLicenses] = useState<string[]>([]);
    const [coAuthors, setCoAuthors] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/check-password?password=${password}`);
            if (response.ok) {
                setAuthenticated(true);
            } else {
                alert('Incorrect password');
            }
        } catch (error) {
            console.log(error)
            alert('An error occurred while checking the password');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unatggedWav || !taggedWav || !taggedMp3) return alert('Please upload all required files');

        const formData = new FormData();
        formData.append('unatggedWav', unatggedWav);
        formData.append('taggedWav', taggedWav);
        formData.append('waggedMp3', taggedMp3);
        formData.append('name', name);
        formData.append('bpm', bpm);
        formData.append('price', price);
        formData.append('key', key);
        formData.append('description', description);
        formData.append('licenses', licenses.join(','));
        formData.append('coAuthors', coAuthors);
        formData.append('tags', tags.join(','));

        try {
            const response = await fetch('/api/upload-beat', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('YAY');
            } else {
                alert('NAY');
            }
        } catch (error) {
            console.log(error)
            alert('NAY');
        }
    };

    return (
        <div>
            {!authenticated ? (
                <form onSubmit={handlePasswordSubmit} id="form1">
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}  
                        className="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
            ) : (
                <form onSubmit={handleFormSubmit}>
                    <div>
                        <label>UNATGGED .wav</label>
                        <input
                            type="file"
                            accept="audio/wav"
                            onChange={(e) => setUnatggedWav(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <div>
                        <label>TAGGED .wav</label>
                        <input
                            type="file"
                            accept="audio/wav"
                            onChange={(e) => setTaggedWav(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <div>
                        <label>TAGGED .mp3</label>
                        <input
                            type="file"
                            accept="audio/mp3"
                            onChange={(e) => setTaggedMp3(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>BPM</label>
                        <input
                            type="text"
                            value={bpm}
                            onChange={(e) => setBpm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Key</label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Price (if included, then exclusive licence is included)</label>
                        <input
                            type="text"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>License</label>
                        <select multiple onChange={(e) => setLicenses(Array.from(e.target.selectedOptions, option => option.value))}>
                            {Object.keys(LICENSES_MAP).map(license => (
                                <option key={license} value={LICENSES_MAP[license as keyof typeof LICENSES_MAP]}>{license}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Co-Authors / Co-Producers</label>
                        <input
                            type="text"
                            value={coAuthors}
                            onChange={(e) => setCoAuthors(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Tags</label>
                        <select multiple onChange={(e) => setTags(Array.from(e.target.selectedOptions, option => option.value))}>
                            {TAGS_ARRAY.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">SEND</button>
                </form>
            )}
        </div>
    );
};

export default Admin;
