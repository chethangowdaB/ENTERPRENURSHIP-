import React from 'react';
import '../styles/footer.css';
import { FaClock, FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaMailBulk, FaPhone, FaRocket } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='foot-container'>
        <div className='left'>
          <div className='location'>
            <div className='add'>
              <p>
                <FaRocket size={20} style={{ color: "white", marginRight: "2rem", marginTop: "1rem" }} />
                Contact for more details
              </p>
            </div>
          </div>
          <div className='phone'>
            <p>
              <FaPhone size={20} style={{ color: "white", marginRight: "2rem" }} />
              +91 725-942-1988
            </p>
          </div>
          <div className='email'>
            <p>
              <FaMailBulk size={20} style={{ color: "white", marginRight: "2rem" }} />
              chb21is@cmrit.ac.in
            </p>
          </div>
        </div>
        <div className='right'>
          <div className='add'>
            <p>
              <FaClock size={20} style={{ color: "white", marginRight: "2rem", marginTop: "1rem" }} />
              24x7 ONLINE SUPPORT
            </p>
            <p className='pa'>Copyrights @2024</p>
          </div>
          <div className='phone'>
            <p className='pa'>
              For more details contact
              <FaFacebook size={20} style={{ color: "white", marginRight: "2rem" }} />
              <FaGithub size={20} style={{ color: "white", marginRight: "2rem" }} />
              <FaInstagram size={20} style={{ color: "white", marginRight: "2rem" }} />
              <FaLinkedin size={20} style={{ color: "white", marginRight: "2rem" }} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
