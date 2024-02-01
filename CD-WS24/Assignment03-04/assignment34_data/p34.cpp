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
      analyze(F);
    }

    static bool isRequired() { return true; }

  private:
    struct Node
    {
      Instruction *I;
      std::vector<Value *> variableUses;
      std::set<Value *> in;
      std::set<Value *> out;

      explicit Node(Instruction *I)
      {
        this->I = I;
        for (auto &Op : I->operands())
        {
          if (auto *V = dyn_cast<Value>(&Op))
          {
            variableUses.push_back(V);
          }
        }
      }
    }

    std::map<Instruction *, Node>
        Nodes;

    analyze(Function &F)
    {
      /* =============== initialize all nodes =============== */
      for (auto &BB : F)
      {
        for (Instruction &I : BB)
        {
          Nodes[&I] = Node(&I);
        }
      }

      /* =============== compute in sets while changes to out sets =============== */
      bool changed = true;
      while (changed)
      {
        changed = false;

        for (BasicBlock &BB : F)
        {
          for (Instruction &I : BB)
          {
            std::set<Value *> GEN = computeGEN(&I);
            std::set<Value *> currentOut = Nodes[&I].out;

            std::set<Value *> IN = computeIN(&I);
            Nodes[&I].in = IN;
            Nodes[&I].out = IN.union(GEN); // this may modify a reference to IN. Needs to be cloned?

            if (currentOut != Nodes[&I].out)
            {
              changed = true;
            }
          }
        }
      }

      /* =============== find unitialized uses =============== */
      for (auto &Node : Nodes)
      {
        for (auto &variableUse : Node.variableUses)
        {
          if (Node.in.find(variableUse) == Node.in.end())
          {
            errs() << "Variable " << variableUse->getName() << " is not initialized before use in instruction " << Node.second.I->getName() << "\n";
          }
        }
      }
    }

    computeGEN(Instruction *I)
    {
      std::set<Value *> GEN;
      if (auto *Store = dyn_cast<StoreInst>(I))
      {
        GEN.insert(Store->getOperand(1));
      }
      return GEN;
    }

    computeIN(Instruction *I)
    {
      std::set<Value *> IN;
      for (auto *Pred : predecessors(I->getParent()))
      {
        IN = IN.intersect(Nodes[Pred->getTerminator()].out);
      }
      return IN;
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
