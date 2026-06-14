"use client";

import { useActionState, useState } from "react";
import { submitRsvp } from "@/app/rsvp/actions";
import { MAX_GUESTS, type RsvpState } from "@/lib/rsvp";
import { Divider } from "@/components/botanical/Divider";

const initialState: RsvpState = { status: "idle" };

export default function RsvpForm() {
  const [state, formAction, isPending] = useActionState(submitRsvp, initialState);
  const [attending, setAttending] = useState<string>(state.values?.attending ?? "");
  const errors = state.errors ?? {};
  const v = state.values;

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-sage/50 bg-ivory/60 px-6 py-12 text-center">
        <Divider className="mx-auto h-8 w-44" />
        <p className="mt-6 font-display text-3xl text-ink sm:text-4xl">With thanks</p>
        <p className="mx-auto mt-3 max-w-sm font-body text-lg text-ink-soft">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="text-left">
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-botanical-red/40 bg-botanical-red/5 px-4 py-3 font-body text-botanical-red"
        >
          {state.message}
        </p>
      )}

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="field-label">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={v?.name}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="field-input"
            placeholder="First & last name"
          />
          {errors.name && (
            <p id="name-error" className="field-error">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={v?.email}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="field-input"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="field-label">Will you join us?</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                id="attending-yes"
                type="radio"
                name="attending"
                value="yes"
                defaultChecked={v?.attending === "yes"}
                onChange={() => setAttending("yes")}
                className="choice-input sr-only"
              />
              <label htmlFor="attending-yes" className="choice block">
                Joyfully accepts
              </label>
            </div>
            <div>
              <input
                id="attending-no"
                type="radio"
                name="attending"
                value="no"
                defaultChecked={v?.attending === "no"}
                onChange={() => setAttending("no")}
                className="choice-input sr-only"
              />
              <label htmlFor="attending-no" className="choice block">
                Regretfully declines
              </label>
            </div>
          </div>
          {errors.attending && <p className="field-error">{errors.attending}</p>}
        </fieldset>

        {attending === "yes" && (
          <>
            <div>
              <label htmlFor="guests" className="field-label">
                Number of guests
              </label>
              <select
                id="guests"
                name="guests"
                defaultValue={v?.guests || "1"}
                aria-invalid={errors.guests ? "true" : undefined}
                className="field-input"
              >
                {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.guests && <p className="field-error">{errors.guests}</p>}
            </div>

            <div>
              <label htmlFor="guestNames" className="field-label">
                Names of all guests
              </label>
              <textarea
                id="guestNames"
                name="guestNames"
                rows={3}
                defaultValue={v?.guestNames}
                className="field-input resize-none"
                placeholder="So we know exactly who to expect"
              />
            </div>
          </>
        )}
      </div>

      <button type="submit" disabled={isPending} className="btn mt-8 w-full disabled:opacity-60">
        {isPending ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
