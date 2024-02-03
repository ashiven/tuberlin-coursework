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
      set<Value *> USES;
      set<Value *> IN;
      set<Value *> GEN;
      set<Value *> OUT;

      explicit Node(const BasicBlock &BB) : USES({}), IN({}), GEN({}), OUT({})
      {
        for (const auto &Inst : BB)
        {
          if (auto *Load = dyn_cast<LoadInst>(&Inst))
          {
            Value *Variable = Load->getOperand(0);
            USES.insert(Variable);
          }
          else if (auto *Store = dyn_cast<StoreInst>(&Inst))
          {
            Value *Variable = Store->getOperand(1);
            GEN.insert(Variable);
          }
        }
      }
    };

    map<BasicBlock *, Node *>
        Nodes;

    void analyze(Function &F)
    {
      /* =============== initialize all nodes =============== */
      for (auto &BB : F)
      {
        Nodes[&BB] = new Node(BB);
      }

      /*
      // print all nodes for debugging
      errs() << " Initial Nodes: \n";
      for (const auto &NodePair : Nodes)
      {
        const Node *Node = NodePair.second;
        errs() << "BasicBlock: " << NodePair.first->getName() << "\n";
        errs() << "USES: ";
        for (auto &Variable : Node->USES)
        {
          errs() << Variable->getName() << " ";
        }
        errs() << "\n";
        errs() << "GEN: ";
        for (auto &Variable : Node->GEN)
        {
          errs() << Variable->getName() << " ";
        }
        errs() << "\n";
      }*/

      /* =============== compute in sets while changes to out sets =============== */
      bool changed = true;
      while (changed)
      {
        changed = false;

        for (BasicBlock &BB : F)
        {
          set<Value *> GEN = Nodes[&BB]->GEN;
          set<Value *> currentOut = Nodes[&BB]->OUT;
          set<Value *> IN = computeIN(&BB);

          set<Value *> newOut;
          set_union(IN.begin(), IN.end(), GEN.begin(), GEN.end(), inserter(newOut, newOut.begin()));

          Nodes[&BB]->IN = IN;
          Nodes[&BB]->OUT = newOut;

          if (currentOut != newOut)
          {
            changed = true;
          }
        }
      }

      /*
      // print all nodes for debugging
      errs() << " Final Nodes: \n";
      for (const auto &NodePair : Nodes)
      {
        const Node *Node = NodePair.second;
        errs() << "BasicBlock: " << NodePair.first->getName() << "\n";
        errs() << "USES: ";
        for (auto &Variable : Node->USES)
        {
          errs() << Variable->getName() << " ";
        }
        errs() << "\n";
        errs() << "GEN: ";
        for (auto &Variable : Node->GEN)
        {
          errs() << Variable->getName() << " ";
        }
        errs() << "\n";
        errs() << "IN: ";
        for (auto &Variable : Node->IN)
        {
          errs() << Variable->getName() << " ";
        }
        errs() << "\n";
        errs() << "OUT: ";
        for (auto &Variable : Node->OUT)
        {
          errs() << Variable->getName() << " ";
        }
        errs() << "\n";
      }
      */

      /* =============== find unitialized uses =============== */
      map<string, bool> reported;
      for (const auto &NodePair : Nodes)
      {
        const Node *Node = NodePair.second;
        set<Value *> UNINIT;
        set_difference(Node->USES.begin(), Node->USES.end(), Node->OUT.begin(), Node->OUT.end(), inserter(UNINIT, UNINIT.begin()));
        for (auto &Variable : UNINIT)
        {
          if (reported.find(Variable->getName()) == reported.end())
          {
            reported[Variable->getName()] = true;
            errs() << Variable->getName() << "\n";
          }
        }
      }
    }

    set<Value *> computeIN(BasicBlock *BB)
    {
      set<Value *> IN;
      for (auto it = pred_begin(BB), et = pred_end(BB); it != et; ++it)
      {
        BasicBlock *Pred = *it;
        set_intersection(IN.begin(), IN.end(), Nodes[Pred]->OUT.begin(), Nodes[Pred]->OUT.end(), inserter(IN, IN.begin()));
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
