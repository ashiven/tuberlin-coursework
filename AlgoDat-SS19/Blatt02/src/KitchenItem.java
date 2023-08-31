
public class KitchenItem extends Item {

	private int totalquantity;
	public int neededquantity;

	public KitchenItem(String name, int n) {
		super(name, "tmp");
		setOwner("shared");
		this.totalquantity = n;
		this.intheCubby = false;
	}

	public KitchenItem(String name, int n, String ownersName) {
		super(name, ownersName);
		this.totalquantity = n;
		this.intheCubby = false;
	}

	public KitchenItem(KitchenItem thing) {
		super(thing.item, "tmp");
		setOwner(thing.getOwner());
		this.totalquantity = thing.totalquantity;
		this.intheCubby = thing.intheCubby;
		this.neededquantity = thing.neededquantity;
	}

	public int getQuantity() {
		return totalquantity;
	}

	public void needed(int n) {
		neededquantity = n;
	}

}
