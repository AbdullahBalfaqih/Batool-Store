'use client';

import { useState } from 'react';
import './floating-contact-button.css';

export function FloatingContactButton() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFab = () => {
        setIsOpen(!isOpen);
    };
    
    // Replace with your actual contact details
    const phoneNumber = "+967771234567";
    const whatsappNumber = "967771234567";
    const emailAddress = "hello@batoollenses.com";


    return (
        <div className={`fab-container ${isOpen ? 'open' : ''}`} id="fabContainer">
            {/* Main FAB button */}
            <div className={`main-fab ${isOpen ? 'active' : ''}`} onClick={toggleFab}>
                <svg id="mainIcon" viewBox="0 0 256 256" style={{ width: '28px', height: '28px', transition: 'transform 0.3s' }}>
                    <path fill="var(--accent-blue)" d="M216,40H40A16,16,0,0,0,24,56V184a16,16,0,0,0,16,16h60.43l13.68,23.94a16,16,0,0,0,27.78,0L155.57,200H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM84,132a12,12,0,1,1,12-12A12,12,0,0,1,84,132Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,132Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,132Z"></path>
                </svg>
            </div>

            {/* Vertical options menu */}
            <div className="fab-options">
                <a href={`tel:${phoneNumber}`} className="option-btn">
                    <span className="tooltip">اتصال</span>
                    <svg viewBox="0 0 256 256">
                        <path d="M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08Z"></path>
                    </svg>
                </a>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="option-btn">
                    <span className="tooltip">واتساب</span>
                    <svg viewBox="0 0 256 256">
                        <path d="M152.58,145.23l23,11.48A24,24,0,0,1,152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-40,24a8,8,0,0,0-4.42-7.16l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88A40,40,0,0,0,192,152Z"></path>
                    </svg>
                </a>
                <a href={`mailto:${emailAddress}`} className="option-btn">
                    <span className="tooltip">إيميل</span>
                    <svg viewBox="0 0 256 256">
                        <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"></path>
                    </svg>
                </a>
            </div>
        </div>
    );
}
