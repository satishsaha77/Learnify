import React from 'react';
import { styles } from '../styles/style';

const About = () => {
    return (
        <div className="text-black dark:text-white">
            <br />
            <h1 className={`${styles.title} 800px:!text-[45px]`}>
                What is <span className="text-gradient">Learnify?</span>
            </h1>
            <br />
            <div className="w-[95%] 800px:w-[85%] m-auto">
                <p className="text-[18px] font-Poppins">
                    Welcome to Learnify, your ultimate destination for skill enhancement and lifelong learning. At Learnify, we are passionate about empowering individuals to unlock their full potential through accessible, innovative, and interactive educational resources. Whether you’re a student, a professional, or simply someone eager to learn, our platform is designed to make your learning journey enjoyable, engaging, and effective.
                    <br />
                    <br />
                    Our mission is to bridge the gap between curiosity and knowledge. We believe that learning should be more than a task—it should be an adventure. That’s why Learnify brings together a diverse range of courses, tutorials, and tools tailored to meet the needs of a dynamic audience. From foundational concepts to advanced expertise, our content caters to learners at every stage of their development.
                    <br />
                    <br />
                    Learnify is built on the foundation of cutting-edge technology and a commitment to quality. We utilize modern platforms and intuitive interfaces to deliver a seamless user experience. Our team of expert educators and developers collaborates to provide content that is not only accurate but also visually compelling and easy to understand.
                    <br />
                    <br />
                    At the heart of Learnify lies a community of like-minded individuals who share a passion for growth. Through forums, interactive sessions, and peer-to-peer learning opportunities, we ensure that learning is not a solitary endeavor. With Learnify, you’re not just a user—you’re part of a growing network of learners and creators dedicated to building a brighter future.
                    <br />
                    <br />
                    Join us on this exciting journey of discovery and innovation. With Learnify, education knows no bounds, and every learner has the power to achieve greatness. Let’s learn, grow, and succeed together!
                </p>
                <br />
                <span className="text-[22px]">Learnify Team</span>
                <h5 className="text-[18px] font-Poppins">
                    Founder of Learnify
                </h5>
                <br />
                <br />
                <br />
            </div>
        </div>
    )
};

export default About;