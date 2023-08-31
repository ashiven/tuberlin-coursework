/**
 * The class Synapse implements a connected directed pair of neurons for the
 * class Network.
 * 
 * @author Vera Röhr
 * @version 1.0
 * @since 2019-01-11
 */
public class Synapse {
	private Neuron presynaptic;
	private Neuron postsynaptic;

	/**
	 * Sets sender and receiver in the pair.
	 * 
	 * @param presynaptic
	 *                     aka sender
	 * @param postsynaptic
	 *                     aka receiver
	 * @throws RuntimeExeption
	 *                         if a photo receptor is set to receive synaptic input.
	 */
	public Synapse(Neuron presynaptic, Neuron postsynaptic) {
		if (presynaptic == null || postsynaptic == null)
			throw new NullPointerException("No neuron to connect.");
		this.presynaptic = presynaptic;
		this.postsynaptic = postsynaptic;
		if (postsynaptic instanceof Photoreceptor)
			throw new RuntimeException("Photo receptors do not receive synaptic input.");
	}

	/**
	 * Gets the sender in the pair.
	 * 
	 * @return sender
	 */
	public Neuron getPre() {
		return this.presynaptic;
	}

	/**
	 * Gets the receiver in the pair.
	 * 
	 * @return receiver
	 */
	public Neuron getPost() {
		return this.postsynaptic;
	}

	/**
	 * Transmits a neural signal from the presynaptic neuron to the postsynaptic
	 * neuron
	 * 
	 * @param signal
	 */
	public void transmit(double[] signal) {
		this.getPost().integrateSignal(signal);
	}

}
