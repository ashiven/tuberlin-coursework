/* Name Surname */

// STL
#include <map>
#include <utility>
#include <vector>

// LLVM
#include "llvm/Passes/PassBuilder.h"
#include "llvm/Passes/PassPlugin.h"
#include <llvm/IR/PassManager.h>
#include <llvm/IR/IRBuilder.h>
// add additional includes from LLVM or STL as needed

using namespace llvm;

namespace
{

  class DefinitionPass : public PassInfoMixin<DefinitionPass>
  {
  public:
    PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM)
    {
      // BB: Basic Block, iterates over all basic blocks in the function
      for (auto &BB : F)
      {
        // Inst: Instruction, iterates over all instructions in the basic block
        for (auto &Inst : BB)
        {
          // check if the instruction is a load instruction, if so, check if the variable is initialized
          if (auto *Load = dyn_cast<LoadInst>(&Inst))
          {
            Value *Variable = Load->getOperand(0);
            if (!isVariableInitialized(Variable))
            {
              reportUninitializedVariable(Variable);
              // set the second value of the tuple to true, so that the variable is not reported again
              VariableState[Variable] = std::make_tuple(false, true);
            }
          }
          // check if the instruction is a store instruction, if so, mark the variable as initialized
          else if (auto *Store = dyn_cast<StoreInst>(&Inst))
          {
            Value *Variable = Store->getOperand(1);
            VariableState[Variable] = std::make_tuple(true, false);
          }
        }
      }
      return PreservedAnalyses::all();
    }

    static bool isRequired() { return true; }

  private:
    std::map<Value *, std::tuple<bool, bool>> VariableState;

    bool isVariableInitialized(Value *Variable)
    {
      // find the variable in the map, which returns an iterator
      auto It = VariableState.find(Variable);
      // if the iterator is not equal to the end of the map and the first value of the tuple is true, the variable is initialized
      return It != VariableState.end() && std::get<0>(It->second);
    }

    void reportUninitializedVariable(Value *Variable)
    {
      if (!std::get<1>(VariableState[Variable]))
      {
        errs() << Variable->getName() << "\n";
      }
    }
  };

  class FixingPass : public PassInfoMixin<FixingPass>
  {
  public:
    PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM)
    {
      for (auto &BB : F)
      {
        for (auto &Inst : BB)
        {
          if (auto *Load = dyn_cast<LoadInst>(&Inst))
          {
            Value *Variable = Load->getOperand(0);
            if (!isVariableInitialized(Variable))
            {
              insertInitialization(F, Variable);
            }
          }
          else if (auto *Store = dyn_cast<StoreInst>(&Inst))
          {
            Value *Variable = Store->getOperand(1);
            VariableState[Variable] = true;
          }
        }
      }
      return PreservedAnalyses::none();
    }

    static bool isRequired() { return true; }

  private:
    std::map<Value *, bool> VariableState;

    bool isVariableInitialized(Value *Variable)
    {
      auto It = VariableState.find(Variable);
      return It != VariableState.end() && It->second;
    }

    void insertInitialization(Function &F, Value *Variable)
    {
      for (auto &BB : F)
      {
        for (auto &Inst : BB)
        {
          if (auto *Alloca = dyn_cast<AllocaInst>(&Inst))
          {
            if (Alloca->getName() == Variable->getName())
            {
              errs() << "Alloca: " << Alloca->getName() << "\n";
              errs() << "Variable: " << Variable->getName() << "\n";
              Type *PointedType = Variable->getType()->getPointerElementType();

              if (PointedType->isIntegerTy())
              {
                errs() << "i32\n";
                StoreInst *newStore = new StoreInst(ConstantInt::get(PointedType, 10), Variable);
                newStore->insertAfter(Alloca);
              }
              else if (PointedType->isFloatTy())
              {
                errs() << "float\n";
                StoreInst *newStore = new StoreInst(ConstantFP::get(PointedType, 20.0), Variable);
                newStore->insertAfter(Alloca);
              }
              else if (PointedType->isDoubleTy())
              {
                errs() << "double\n";
                StoreInst *newStore = new StoreInst(ConstantFP::get(PointedType, 30.0), Variable);
                newStore->insertAfter(Alloca);
              }
              else
              {
                errs() << "unknown type\n";
              }
              VariableState[Variable] = true;
              break;
            }
          }
        }
      }
    }
  };
} // namespace

// Pass registrations
llvm::PassPluginLibraryInfo
getP34PluginInfo()
{
  return {LLVM_PLUGIN_API_VERSION, "P34", LLVM_VERSION_STRING,
          [](PassBuilder &PB)
          {
            PB.registerPipelineParsingCallback(
                [](StringRef Name, llvm::FunctionPassManager &PM,
                   ArrayRef<llvm::PassBuilder::PipelineElement>)
                {
                  if (Name == "def-pass")
                  {
                    PM.addPass(DefinitionPass());
                    return true;
                  }
                  if (Name == "fix-pass")
                  {
                    PM.addPass(FixingPass());
                    return true;
                  }
                  return false;
                });
          }};
}

extern "C" LLVM_ATTRIBUTE_WEAK ::llvm::PassPluginLibraryInfo
llvmGetPassPluginInfo()
{
  return getP34PluginInfo();
}
