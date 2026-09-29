import React from 'react'

import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'
import Footer from '../components/Footer'

export default function Home() {
    return (
        <div className="page-container">
            <Header />
            <div className="content">
                <Sidebar />
                <Editor />
            </div>
            <Footer />
        </div>
    )
}