import java.util.LinkedList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class PermutationTest {
	PermutationVariation p1;
	PermutationVariation p2;
	public int n1;
	public int n2;
	int cases = 1;

	void initialize() {
		n1 = 4;
		n2 = 6;
		Cases c = new Cases();
		p1 = c.switchforTesting(cases, n1);
		p2 = c.switchforTesting(cases, n2);
	}

	@Test
	void testPermutation() {
		initialize();
		assertEquals(n1, p1.original.length, "P1: wrong length of original");
		for (int i = 0; i < n1; i++) {
			int tmp = p1.original[i];
			for (int j = i + 1; j < n1; j++)
				if (p1.original[j] == tmp) {
					assertTrue(false, "P1: multiple same numbers in original");
				}
		}
		assertNotEquals(null, p1.allDerangements, "P1: allderangements not initialized");
		assertTrue(p1.allDerangements.isEmpty(), "P1: allderangements not empty");

		assertEquals(n2, p2.original.length, "P2: wrong length of original");
		for (int i = 0; i < n2; i++) {
			int tmp = p2.original[i];
			for (int j = i + 1; j < n2; j++)
				if (p2.original[j] == tmp) {
					assertTrue(false, "P2: multiple same numbers in original");
				}
		}
		assertNotEquals(null, p2.allDerangements, "P2: allderangements not initialized");
		assertTrue(p2.allDerangements.isEmpty(), "P2: allderangements not empty");
	}

	@Test
	void testDerangements() {
		initialize();
		// in case there is something wrong with the constructor
		fixConstructor();

		p1.derangements();
		p2.derangements();

		assertEquals(9, p1.allDerangements.size(), "P1: wrong number of derangements");
		for (int i = 0; i < p1.allDerangements.size(); i++) {
			for (int j = 0; j < p1.original.length; j++) {
				if (p1.allDerangements.get(i)[j] == p1.original[j]) {
					assertTrue(false, "P1: nicht fixpunktfrei");
				}
			}
		}

		assertEquals(265, p2.allDerangements.size(), "P2: wrong number of derangements");
		for (int i = 0; i < p2.allDerangements.size(); i++) {
			for (int j = 0; j < p2.original.length; j++) {
				if (p2.allDerangements.get(i)[j] == p2.original[j]) {
					assertTrue(false, "P2: nicht fixpunktfrei");
				}
			}
		}
	}

	@Test
	void testsameElements() {
		initialize();
		// in case there is something wrong with the constructor
		fixConstructor();

		p1.derangements();
		p2.derangements();

		assertFalse(p1.allDerangements.isEmpty(), "P1: no derangements in allderangements");
		assertFalse(p2.allDerangements.isEmpty(), "P2: no derangements in allderangements");

		for (int k = 0; k < p1.allDerangements.size(); k++) {
			boolean contains = false;
			for (int i = 0; i < p1.original.length; i++) {
				for (int j = 0; j < p1.original.length; j++) {
					if (p1.allDerangements.get(k)[j] == p1.original[i]) {
						contains = true;
					}
				}
				if (!contains) {
					assertTrue(false, "P1: wrong derangement detected");
				}
				contains = false;
			}
		}

		for (int k = 0; k < p2.allDerangements.size(); k++) {
			boolean contains2 = false;
			for (int i = 0; i < p2.original.length; i++) {
				for (int j = 0; j < p2.original.length; j++) {
					if (p2.allDerangements.get(k)[j] == p2.original[i]) {
						contains2 = true;
					}
				}
				if (!contains2) {
					assertTrue(false, "P2: wrong derangement detected");
				}
				contains2 = false;
			}
		}
	}

	void setCases(int c) {
		this.cases = c;
	}

	public void fixConstructor() {
		// in case there is something wrong with the constructor
		p1.allDerangements = new LinkedList<int[]>();
		for (int i = 0; i < n1; i++)
			p1.original[i] = 2 * i + 1;

		p2.allDerangements = new LinkedList<int[]>();
		for (int i = 0; i < n2; i++)
			p2.original[i] = i + 1;
	}
}
