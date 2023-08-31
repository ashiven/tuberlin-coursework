import java.util.*;

public class ManagetheChaos {
	List<KitchenItem> allItems;
	Stack<Item> cubby;
	int cubbysize = 15;

	public ManagetheChaos(List<KitchenItem> kitchenItems) {
		allItems = kitchenItems;
		cubby = new Stack<Item>();
	}

	public ManagetheChaos(List<KitchenItem> kitchenItems, Stack C) {
		allItems = kitchenItems;
		if (C.size() > cubbysize)
			throw new RuntimeException("Cubby is not that big!");
		cubby = C;
	}

	public List<Item> findSpares() {
		LinkedList<Item> spares = new LinkedList<Item>();
		for (int i = 0; i < allItems.size(); i++) {
			KitchenItem itm = allItems.get(i);
			int total = itm.getQuantity();
			int needed = itm.neededquantity;
			if (total > needed) {
				for (int j = 0; j < total - needed; j++) {
					Item newitm = new Item(itm.item, itm.getOwner());
					spares.add(j, newitm);
				}
			}
		}
		return spares;
	}

	public void putAway() {
		LinkedList<Item> spres = (LinkedList) findSpares();
		Collections.sort(spres);
		for (int i = 0; i < spres.size(); i++) {
			if (cubby.size() > cubbysize - 1) {
				throw new RuntimeException("der cubby ist zu voll");
			}
			spres.get(i).intheCubby = true;
			cubby.add(spres.get(i));
		}
	}

	public void putAwaySmart() {
		LinkedList<Item> spres = (LinkedList) findSpares();
		Collections.sort(spres);
		int index = 0;
		for (int i = 0; i < cubby.size(); i++) {
			if (cubby.get(i) == null) {
				spres.get(index).intheCubby = true;
				cubby.removeElementAt(i);
				cubby.add(i, spres.get(index));
				index++;
			}
		}
		for (int j = index; j < spres.size(); j++) {
			if (cubby.size() > cubbysize - 1) {
				throw new RuntimeException("der cubby ist zu voll");
			}
			spres.get(j).intheCubby = true;
			cubby.add(spres.get(j));
		}
	}

	public boolean replaceable(Item item) {
		if (cubby.contains(item)) {
			return true;
		}
		return false;
	}

	public Item replace(Item item) {
		if (item == null)
			throw new RuntimeException("item ist null");
		if (!replaceable(item))
			throw new RuntimeException("item nicht ersetzbar");
		Item tmp = new Item("tmpitem", "tmpowner");
		for (int i = 0; i < cubby.size(); i++) {
			if (cubby.get(i).equals(item)) {
				tmp.setOwner(cubby.get(i).getOwner());
				tmp.item = cubby.get(i).item;
				tmp.intheCubby = false;
				cubby.removeElementAt(i);
				cubby.add(i, null);
				break;
			}
		}
		return tmp;
	}

	public static void main(String[] args) {
		KitchenItem ki1 = new KitchenItem("Messer", 8);
		KitchenItem ki3 = new KitchenItem("Gabel", 5, "Gabriel");
		KitchenItem ki4 = new KitchenItem("Teller", 7, "Johann");
		KitchenItem ki5 = new KitchenItem("Löffel", 6, "Alex");
		KitchenItem ki6 = new KitchenItem("Tasse", 5, "Brüno");

		LinkedList<KitchenItem> KIList = new LinkedList<KitchenItem>();
		KIList.add(ki1);
		KIList.add(ki3);
		KIList.add(ki4);
		KIList.add(ki5);
		KIList.add(ki6);

		ManagetheChaos mng = new ManagetheChaos(KIList);

		System.out.println("allitems vor putaway:");
		for (int m = 0; m < 5; m++) {
			mng.allItems.get(m).needed(4);
			System.out.println(mng.allItems.get(m) + " total:" + mng.allItems.get(m).getQuantity() + " needed:"
					+ mng.allItems.get(m).neededquantity);
		}

		LinkedList<KitchenItem> spares = (LinkedList) mng.findSpares();
		System.out.println("\nspares:");
		for (int i = 0; i < spares.size(); i++) {
			System.out.println(spares.get(i));
		}

		Item extra = new Item("Extra1", "Manuel");
		Item extra1 = new Item("Extra2", "Ebert");
		mng.cubby.push(null);
		mng.cubby.push(extra);
		mng.cubby.push(null);
		mng.cubby.push(extra1);

		mng.putAwaySmart();
		System.out.println("\ncubby:");
		for (int j = mng.cubby.size() - 1; j > -1; j--) {
			System.out.println(mng.cubby.get(j));
		}

		System.out.println("\nallitems nach putaway:");
		for (int k = 0; k < 5; k++) {
			mng.allItems.get(k).needed(4);
			System.out.println(mng.allItems.get(k) + " total:" + mng.allItems.get(k).getQuantity() + " needed:"
					+ mng.allItems.get(k).neededquantity);
		}

		boolean rep = mng.replaceable(ki3);
		Item replacement = mng.replace(ki3);
		System.out.println("\nreplaceable: " + rep + " replacement: " + replacement);

		System.out.println("\ncubby after replacement:");
		for (int c = mng.cubby.size() - 1; c > -1; c--) {
			System.out.println(mng.cubby.get(c));
		}
	}
}
