
/**
 * The class Neuron implements a cortical neuron for the class Network.
 * 
 * The final signals are calculated within the cortical neurons.
 * 
 * @author Vera Röhr
 * @version 1.0
 * @since 2019-01-11
 */
public class CorticalNeuron extends Neuron {
	/** the final neural signal */
	private double[] signal = new double[3];

	/**
	 * {@inheritDoc} For simplicity reasons cortical neurons do not have outgoing
	 * synapses initiated
	 */
	public CorticalNeuron(int index) {
		super(index);
	}

	/**
	 * Adds incoming neural signal to one final signal.
	 * 
	 * @param input
	 *              3 dimensional signal from another neuron
	 * @return 3 dimensional neural signal (after processing)
	 */
	@Override
	public double[] integrateSignal(double[] signal) {
		for (int i = 0; i < 3; i++) {
			this.signal[i] = this.signal[i] + signal[i];
		}
		return this.signal;
	}

	/**
	 * Gets current signal
	 * 
	 * @return current signal
	 */
	public double[] getSignal() {
		return this.signal;
	}

	/**
	 * Resets signal
	 */
	public void reset() {
		this.signal = new double[3];
	}
}
