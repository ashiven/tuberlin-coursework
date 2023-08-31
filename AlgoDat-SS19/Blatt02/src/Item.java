
public class Item implements Comparable<Item> {
	public String item;
	private String owner;
	public boolean intheCubby;

	public Item(String name, String ownersName) {
		this.item = name;
		this.owner = ownersName;
	}

	public String getOwner() {
		return this.owner;
	}

	public void setOwner(String name) {
		this.owner = name;
	}

	@Override
	public int compareTo(Item o) {
		return this.owner.compareTo(o.owner);
	}

	@Override
	public String toString() {
		String str = "" + this.owner + ": " + this.item + "";
		return str;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null) {
			return false;
		}
		Item thing = (Item) obj;
		return thing.item.equals(this.item);
	}

	@Override
	public int hashCode() {
		return this.item.hashCode();
	}

}
