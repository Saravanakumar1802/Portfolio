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
            <img className="email_icon" alt="svgImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iNDgiIGhlaWdodD0iNDgiCnZpZXdCb3g9IjAgMCA0OCA0OCI+CjxwYXRoIGZpbGw9IiNlMGUwZTAiIGQ9Ik01LjUsNDAuNWgzN2MxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41VjExYzAtMS45MzMtMS41NjctMy41LTMuNS0zLjVoLTM3QzMuNTY3LDcuNSwyLDkuMDY3LDIsMTF2MjZDMiwzOC45MzMsMy41NjcsNDAuNSw1LjUsNDAuNXoiPjwvcGF0aD48cGF0aCBmaWxsPSIjZDlkOWQ5IiBkPSJNMjYsNDAuNWgxNi41YzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVWMTFjMC0xLjkzMy0xLjU2Ny0zLjUtMy41LTMuNWgtMzdDMy41NjcsNy41LDIsOS4wNjcsMiwxMUwyNiw0MC41eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNlZWUiIGQ9Ik02Ljc0NSw0MC41SDQyLjVjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVYxMS41TDYuNzQ1LDQwLjV6Ij48L3BhdGg+PHBhdGggZmlsbD0iI2UwZTBlMCIgZD0iTTI1Ljc0NSw0MC41SDQyLjVjMS45MzMsMCwzLjUtMS41NjcsMy41LTMuNVYxMS41TDE4Ljc3MSwzMS42MTZMMjUuNzQ1LDQwLjV6Ij48L3BhdGg+PHBhdGggZmlsbD0iI2NhMzczNyIgZD0iTTQyLjUsOS41aC0zN0MzLjU2Nyw5LjUsMiw5LjA2NywyLDExdjI2YzAsMS45MzMsMS41NjcsMy41LDMuNSwzLjVIN1YxMmgzNHYyOC41aDEuNWMxLjkzMywwLDMuNS0xLjU2NywzLjUtMy41VjExQzQ2LDkuMDY3LDQ0LjQzMyw5LjUsNDIuNSw5LjV6Ij48L3BhdGg+PHBhdGggZmlsbD0iI2Y1ZjVmNSIgZD0iTTQyLjUsNy41SDI0SDUuNUMzLjU2Nyw3LjUsMiw5LjAzNiwyLDExYzAsMS4yMDYsMS41MTgsMi4yNTgsMS41MTgsMi4yNThMMjQsMjcuNzU2bDIwLjQ4Mi0xNC40OTdjMCwwLDEuNTE4LTEuMDUzLDEuNTE4LTIuMjU4QzQ2LDkuMDM2LDQ0LjQzMyw3LjUsNDIuNSw3LjV6Ij48L3BhdGg+PHBhdGggZmlsbD0iI2U4NGY0YiIgZD0iTTQzLjI0Niw3LjU4MkwyNCwyMUw0Ljc1NCw3LjU4MkMzLjE4LDcuOTE5LDIsOS4yOTcsMiwxMWMwLDEuMjA2LDEuNTE4LDIuMjU4LDEuNTE4LDIuMjU4TDI0LDI3Ljc1NmwyMC40ODItMTQuNDk3YzAsMCwxLjUxOC0xLjA1MywxLjUxOC0yLjI1OEM0Niw5LjI5Nyw0NC44Miw3LjkxOSw0My4yNDYsNy41ODJ6Ij48L3BhdGg+Cjwvc3ZnPg==" />
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