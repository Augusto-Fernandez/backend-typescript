import Stripe from "stripe";
import env from "../config/validateEnv";

const stripeCheckout = async (cartAmount: number) => {
    const stripe = new Stripe(env.STRIPE_PRIVATE_KEY);

    await stripe.paymentIntents.create({
        amount: cartAmount*100,
        currency: "usd",
        payment_method_types: ["card"],
        confirm: true,
    });
};

export default stripeCheckout;
