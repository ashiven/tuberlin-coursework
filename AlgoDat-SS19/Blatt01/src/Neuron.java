import java.util.ArrayList;

/**
 * The class Neuron implements a generic Neuron for the class Network.
 * 
 * @author Vera Röhr
 * @version 1.0
 * @since 2019-01-11
 */
public abstract class Neuron {
	/** Each neuron has its own index */
	int index;
	ArrayList<Synapse> outgoingsynapses;

	/**
	 * Gives the neuron its index.
	 * 
	 * @param index
	 */
	public Neuron(int index) {
		this.index = index;
	}

	/**
	 * @param signal
	 *               depending on the neuron either the light signal or input signal
	 *               from another neuron
	 * @return neural signal (after processing)
	 */
	public abstract double[] integrateSignal(double[] signal);

	/**
	 * Adds outgoing synapse to the Neuron
	 * 
	 * @param synapse
	 */
	public void addSynapse(Synapse synapse) {
		this.outgoingsynapses.add(synapse);
	}
}
