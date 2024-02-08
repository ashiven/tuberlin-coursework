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
#include <llvm/IR/Constants.h>
// add additional includes from LLVM or STL as needed

using namespace llvm;
using namespace std;

namespace
{

  class DefinitionPass : public PassInfoMixin<DefinitionPass>
  {
  public:
    PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM)
    {
      analyze(F);
      return PreservedAnalyses::all();
    }

    static bool isRequired() { return true; }

  private:
    struct Node
    {
      set<string> USES;
      set<string> IN;
      set<string> GEN;
      set<string> KILL;
      set<string> OUT;
      bool firstNode = false;

      explicit Node(const BasicBlock &BB) : USES({}), IN({}), GEN({}), KILL({}), OUT({})
      {
        for (const auto &Inst : BB)
        {
          if (auto *Load = dyn_cast<LoadInst>(&Inst))
          {
            Value *Variable = Load->getOperand(0);
            USES.insert(Variable->getName());
          }
          else if (auto *Store = dyn_cast<StoreInst>(&Inst))
          {
            Value *Variable = Store->getOperand(1);
            GEN.insert(Variable->getName());
          }
        }
      }
    };

    map<BasicBlock *, Node *>
        Nodes;

    map<string, string> Dummys;

    void analyze(Function &F)
    {
      /* =============== initialize all nodes and dummys =============== */
      for (auto &BB : F)
      {
        for (auto &Inst : BB)
        {
          if (auto *Alloca = dyn_cast<AllocaInst>(&Inst))
          {
            string VariableName = Alloca->getName();
            Dummys[VariableName] = "d_" + VariableName;
          }
        }
      }
      set<string> dummySet;
      for (auto &DummyPair : Dummys)
      {
        dummySet.insert(DummyPair.second);
      }

      bool firstNode = true;
      for (auto &BB : F)
      {
        Nodes[&BB] = new Node(BB);
        if (firstNode)
        {
          Nodes[&BB]->IN = dummySet;
          Nodes[&BB]->firstNode = true;
          firstNode = false;
        }
        for (auto &Variable : Nodes[&BB]->GEN)
        {
          Nodes[&BB]->KILL.insert(Dummys[Variable]);
        }
      }

      // print all nodes for debugging
      /*
      for (const auto &NodePair : Nodes)
      {
        const Node *Node = NodePair.second;
        errs() << NodePair.first->getName();
        errs() << " USES: ";
        for (const auto &Variable : Node->USES)
        {
          errs() << Variable << " ";
        }
        errs() << " GEN: ";
        for (const auto &Variable : Node->GEN)
        {
          errs() << Variable << " ";
        }
        errs() << " KILL: ";
        for (const auto &Variable : Node->KILL)
        {
          errs() << Variable << " ";
        }
        errs() << " IN: ";
        for (const auto &Variable : Node->IN)
        {
          errs() << Variable << " ";
        }
        errs() << "\n";
      }
      */

      /* =============== compute in sets while changes to out sets =============== */
      bool changed = true;
      int iteration = 0;
      while (changed)
      {
        changed = false;

        for (BasicBlock &BB : F)
        {
          set<string> GEN = Nodes[&BB]->GEN;
          set<string> currentOut = Nodes[&BB]->OUT;
          set<string> IN = !Nodes[&BB]->firstNode ? computeIN(&BB) : Nodes[&BB]->IN;

          set<string> outIn;
          set_difference(IN.begin(), IN.end(), Nodes[&BB]->KILL.begin(), Nodes[&BB]->KILL.end(), inserter(outIn, outIn.begin()));

          set<string> newOut;
          set_union(outIn.begin(), outIn.end(), GEN.begin(), GEN.end(), inserter(newOut, newOut.begin()));

          // print IN and OUT sets for debugging
          /*
          errs() << "[" << iteration << "] " << BB.getName() << " IN: ";
          for (const auto &Variable : IN)
          {
            errs() << Variable << " ";
          }
          errs() << " OUT: ";
          for (const auto &Variable : newOut)
          {
            errs() << Variable << " ";
          }
          errs() << "\n";
          */

          Nodes[&BB]->IN = IN;
          Nodes[&BB]->OUT = newOut;

          if (currentOut != newOut)
          {
            changed = true;
          }
        }
        iteration++;
      }

      /* =============== find unitialized uses =============== */
      map<string, bool> reported;
      for (const auto &NodePair : Nodes)
      {
        const Node *Node = NodePair.second;
        for (auto &Variable : Node->USES)
        {
          if (Node->OUT.find(Dummys[Variable]) != Node->OUT.end())
          {
            if (reported.find(Variable) == reported.end())
            {
              reported[Variable] = true;
              errs() << Variable << "\n";
            }
          }
        }
      }
    }

    set<string> computeIN(BasicBlock *BB)
    {
      set<string> IN;

      if (pred_empty(BB))
      {
        return IN;
      }

      IN = Nodes[*(pred_begin(BB))]->OUT;

      for (auto it = next(pred_begin(BB)), et = pred_end(BB); it != et; ++it)
      {
        BasicBlock *Pred = *it;
        set<string> result;

        set_union(IN.begin(), IN.end(), Nodes[Pred]->OUT.begin(), Nodes[Pred]->OUT.end(), inserter(result, result.begin()));

        IN = result;
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
    map<Value *, bool> VariableState;

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
