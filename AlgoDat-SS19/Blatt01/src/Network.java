/**
 * <NEWLINE>
 * 
 * The Network class implements a neural network.
 * <p>
 * The network consists of three types of neurons: photoreceptors(@see
 * Photoreceptor), interneurons(@see Interneuron) and 6 cortical neurons(@see
 * CorticalNeuron). The network processes light waves. There are three types of
 * photoreceptors, that perceive the different colors.
 * 
 * @author Vera Röhr
 * @version 1.0
 * @since 2019-01-11
 */
public class Network {
	/** #Photoreceptors in the network */
	int receptors;
	/** #Cortical neurons in the network */
	int cortical;
	/** All the neurons in the network */
	Neuron[] neurons;
	/** Different receptor types */
	String[] receptortypes = { "blue", "green", "red" };

	/**
	 * Adds neurons to the network.
	 * <p>
	 * Defines the neurons in the network.
	 * 
	 * @param inter
	 *                  #Interneurons
	 * @param receptors
	 *                  #Photoreceptors
	 * @param cortical
	 *                  #CorticalNeurons
	 */
	public Network(int inter, int receptors, int cortical) {

		if (receptors < 3) {
			throw new RuntimeException("too few receptors");
		}
		if (inter < receptors) {
			throw new RuntimeException("too few interneurons");
		}
		this.cortical = cortical;
		this.receptors = receptors;
		this.neurons = new Neuron[inter + receptors + cortical];

		int balance = receptors / 3;
		int rest = receptors % 3;

		for (int i = 0; i < balance * 3; i = i + 3) {
			neurons[i] = new Photoreceptor(i, "blue");
			neurons[i + 1] = new Photoreceptor(i + 1, "green");
			neurons[i + 2] = new Photoreceptor(i + 2, "red");
		}
		if (rest != 0) {
			neurons[balance * 3] = new Photoreceptor(balance * 3, "blue");
			if (rest == 2) {
				neurons[balance * 3 + 1] = new Photoreceptor(balance * 3 + 1, "green");
			}
		}
		for (int k = receptors; k < receptors + cortical; k++) {
			neurons[k] = new CorticalNeuron(k);
		}
		for (int m = receptors + cortical; m < receptors + cortical + inter; m++) {
			neurons[m] = new Interneuron(m);
		}
	}

	/**
	 * Add a Synapse between the Neurons. The different neurons have their outgoing
	 * synapses as an attribute. ({@link Interneuron}, {@link Photoreceptor},
	 * {@link CorticalNeuron})
	 * 
	 * @param n1
	 *           Presynaptic Neuron (Sender)
	 * @param n2
	 *           Postsynaptic Neuron (Receiver)
	 */

	public void addSynapse(Neuron n1, Neuron n2) {
		Synapse syn = new Synapse(n1, n2);
		n1.outgoingsynapses.add(syn);
	}

	/**
	 * Processes the light waves. The lightwaves are integrated be the
	 * photoreceptors (@see Photoreceptor.integrateSignal(double[] signal)) and the
	 * final neural signal is found by summing up the signals in the cortical
	 * neurons(@see CorticalNeuron)
	 * 
	 * @param input
	 *              light waves
	 * @return the neural signal that can be used to classify the color
	 */
	public double[] signalprocessing(double[] input) {

		double[] signal = { 0, 0, 0 };

		for (int i = 0; i < receptors; i++) {
			this.neurons[i].integrateSignal(input);
		}

		for (int j = receptors; j < receptors + cortical; j++) {
			CorticalNeuron temp = (CorticalNeuron) this.neurons[j];
			for (int n = 0; n < 3; n++) {
				signal[n] = signal[n] + temp.getSignal()[n];
			}
		}

		for (int k = 0; k < 3; k++) {
			signal[k] = signal[k] / countColorreceptors()[k];
		}
		return signal;
	}

	public double[] countColorreceptors() {
		double[] colorreceptors = new double[3];
		Photoreceptor c;

		for (int i = 0; i < this.receptors; i++) {
			c = (Photoreceptor) this.neurons[i];
			if (c.type == "blue")
				colorreceptors[0]++;
			else if (c.type == "green")
				colorreceptors[1]++;
			else if (c.type == "red")
				colorreceptors[2]++;
		}
		return colorreceptors;

	}

	/**
	 * Classifies the neural signal to a color.
	 * 
	 * @param signal
	 *               neural signal from the cortical neurons
	 * @return color of the mixed light signals as a String
	 */
	public String colors(double[] signal) {
		String color = "grey";
		if (signal[0] > 0.6 && signal[1] < 0.074)
			color = "violet";
		else if (signal[0] > 0.21569 && signal[1] < 0.677)
			color = "blue";
		else if (signal[0] <= 0.21569 && signal[1] > 0.677 && signal[2] > 0.333)
			color = "green";
		else if (signal[1] < 0.713 && signal[2] > 0.913)
			color = "yellow";
		else if (signal[1] > 0.068 && signal[2] > 0.227)
			color = "orange";
		else if (signal[2] > 0.002)
			color = "red";
		return color;
	}

	public static void main(String[] args) {

		Network net = new Network(10, 10, 10);
		for (int j = 0; j < 10; j++) {
			Photoreceptor re = (Photoreceptor) net.neurons[j];
			System.out.println("neurons[" + j + "]=" + net.neurons[j] + " and type=" + re.type);
		}
		for (int i = 10; i < 30; i++) {
			System.out.println("neurons[" + i + "]=" + net.neurons[i]);
		}
		double[] input = { 500, 500, 500 };
		System.out.println("processed signal:");
		for (int k = 0; k < 3; k++) {
			System.out.println("signal[" + k + "]=" + net.signalprocessing(input)[k]);
		}
		System.out.println("die farbe ist " + net.colors(net.signalprocessing(input)));
	}

}
