import React, { useState } from "react";
import { Header } from "../../layouts/header/header";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log("Form submitted:", formData);
    // Reset form after submission
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Header />
      <div className="info-content animated-slideInUp">
        <h1 className="info-title">Get in Touch</h1>
        <div className="contact-content animated-slideInUp">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p className="text-light">
              Have questions or need assistance? Reach out to us using the form
              or our contact details below.
            </p>
            <ul>
              <li>
                <i className="fas fa-envelope"></i> info@example.com
              </li>
              <li>
                <i className="fas fa-phone"></i> (123) 456-7890
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> 123 Main St, City,
                State 12345
              </li>
            </ul>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your email address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
