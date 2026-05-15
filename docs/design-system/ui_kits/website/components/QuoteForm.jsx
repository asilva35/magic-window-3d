// magic — QuoteForm
// "Get a free quote" form. Fields: full name, email, phone, source.
// Used at bottom of every product page and as the "Book a Quote" target.

function QuoteForm({ onSubmit = () => {} }) {
  const [values, setValues] = React.useState({ name: "", email: "", phone: "", source: "" });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const update = (k) => (e) => setValues(v => ({ ...v, [k]: e.target.value }));

  const submit = () => {
    const e = {};
    if (!values.name.trim()) e.name = "Please enter your name.";
    if (!values.email.includes("@")) e.email = "Please enter a valid email.";
    if (values.phone.replace(/\D/g, "").length < 7) e.phone = "Please enter a phone number.";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSubmitted(true);
      onSubmit(values);
    }
  };

  if (submitted) {
    return (
      <div className="mw-form mw-form--success">
        <h3 className="mw-form__title">Thank you!</h3>
        <p className="mw-form__sub">Your submission has been received. We'll be in touch shortly to book your free in-home consultation.</p>
      </div>
    );
  }

  return (
    <div className="mw-form">
      <h3 className="mw-form__title">Get a free quote</h3>
      <p className="mw-form__sub">Ready to see Magic? Drop your information below and we'll contact you to book a free in-home consultation.</p>

      <div className="mw-form__grid">
        <Field label="Full name"  value={values.name}  onChange={update("name")}  error={errors.name} />
        <Field label="Email"      value={values.email} onChange={update("email")} error={errors.email} type="email" />
        <Field label="Phone"      value={values.phone} onChange={update("phone")} error={errors.phone} type="tel" />
        <Field label="How did you hear about us?" value={values.source} onChange={update("source")} />
      </div>

      <div className="mw-form__actions">
        <button className="mw-btn mw-btn--primary mw-btn--wide" onClick={submit}>Submit Information</button>
        <a className="mw-btn mw-btn--tertiary" href="tel:1-866-65-62442">Give us a call</a>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text" }) {
  const isActive = value && value.length > 0;
  const klass = "mw-field" + (error ? " is-error" : isActive ? " is-active" : "");
  return (
    <label className={klass}>
      <span className="mw-field__label">{label}</span>
      <input className="mw-field__input" type={type} value={value} onChange={onChange} />
      {error && <span className="mw-field__error">{error}</span>}
    </label>
  );
}

window.QuoteForm = QuoteForm;
