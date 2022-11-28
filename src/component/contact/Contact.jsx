import React from 'react'
import './contact.css'

const Contact = () => {
  return (
    <section className='contact_main_container' id='contact'>
      <div className="contact_title_main">
        <h5>Get In Touch</h5>
        <h2 className='contact_title'>Contact Me</h2>
      </div>


      <div className="container contact_container">
        <div className="contact_options">
          <article className="contact_option">
            <i className="contact_icon email_icon uil uil-envelope-alt"></i>
            <h4>Email</h4>
            <h5>saravana1802kumar@gmail.com</h5>
            <a href="mailto:saravana1802kumar@gmail.com" rel="noreferrer" target="_blank">Send a message</a>
          </article>

          <article className="contact_option">
            <i className="contact_icon whatsapp_icon uil uil-whatsapp"></i>
            <h4>Whats's App</h4>
            <h5>91+ 8248463245</h5>
            <a href="https://wa.me/+918248463245 " rel="noreferrer" target="_blank">Send a message</a>
          </article>
        </div>
        <form actions="">
          <input type="text" name='name' placeholder='Your Name' required />
          <input type="text" name='email' placeholder='Your Email' required />
          <textarea name="Message" rows="6" placeholder='Your Message' required ></textarea>
          <button type='submit' className='contact_button'>Send Message</button>

        </form>
      </div>
    </section>


  )
}

export default Contact