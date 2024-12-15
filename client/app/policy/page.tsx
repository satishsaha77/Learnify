'use client'

import React, { useState } from 'react'
import Heading from '../utils/Heading';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Policy from './Policy';

type Props = {};

const page = (props: Props) => {

    const [open, setOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(3);
    const [route, setRoute] = useState("Login");

    return (
        <div>
            <Heading
                title="Policy - Learnify"
                description='Learnify is a learning management system for helping programmers'
                keywords='programming, mern'
            />
            <Header
                open={open}
                setOpen={setOpen}
                activeItem={activeItem}
                setRoute={setRoute}
                route={route}
            />
            <Policy />
            <Footer />
        </div>
    )
}

export default page;