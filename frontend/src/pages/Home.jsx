import React from 'react'

import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'

export default function Home() {
    return (
        <div className="workspace-page">
            <Header />
            <div className="content">
                <Sidebar />
                <Editor />
            </div>
        </div>
    )
}