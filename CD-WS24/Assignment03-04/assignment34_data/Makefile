CXXFLAGS=-rdynamic $(shell llvm-config --cxxflags) -g -O0 -fPIC
LDFLAGS=$(shell llvm-config --ldflags)
LDLIBS=$(shell llvm-config --libs)

all: p34.so

%.so: %.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) -shared -dynamiclib -o $@ $^ $(LDLIBS)


clean:
	rm -f *.o *.so
