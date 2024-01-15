/* Name Surname */

// STL
#include <map>
#include <utility>
#include <vector>

// LLVM
#include "llvm/Passes/PassBuilder.h"
#include "llvm/Passes/PassPlugin.h"
#include <llvm/IR/PassManager.h>
// add additional includes from LLVM or STL as needed


using namespace llvm;

namespace {

class DefinitionPass : public PassInfoMixin<DefinitionPass> {
public:

  PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM) {
    // TODO
    errs() << "def-pass\n";
    return PreservedAnalyses::all();
  }

  static bool isRequired() { return true; }
};

class FixingPass : public PassInfoMixin<FixingPass> {
public:

  PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM) {
    // TODO
    errs() << "fix-pass\n";
    return PreservedAnalyses::none();
  }

  static bool isRequired() { return true; }
};
} // namespace

// Pass registrations
llvm::PassPluginLibraryInfo getP34PluginInfo() {
  return {LLVM_PLUGIN_API_VERSION, "P34", LLVM_VERSION_STRING,
          [](PassBuilder &PB) {
            PB.registerPipelineParsingCallback(
                [](StringRef Name, llvm::FunctionPassManager &PM,
                   ArrayRef<llvm::PassBuilder::PipelineElement>) {
                  if (Name == "def-pass") {
                    PM.addPass(DefinitionPass());
                    return true;
                  }
                  if (Name == "fix-pass") {
                    PM.addPass(FixingPass());
                    return true;
                  }
                  return false;
                });
          }};
}

extern "C" LLVM_ATTRIBUTE_WEAK ::llvm::PassPluginLibraryInfo
llvmGetPassPluginInfo() {
  return getP34PluginInfo();
}

