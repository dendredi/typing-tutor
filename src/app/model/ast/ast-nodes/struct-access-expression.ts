import { AstNode } from "../ast-node";
import { Edge, Graph } from "../../common/graph/_module";


import { TypeEnvironment } from "../../typing/type-environment";
import { AbstractType as AbstractType_ } from "src/app/model/typing/types/abstract-type";
import { Identifier } from "./identifier";
import { StructType } from "../../typing/types/type-constructors/struct-type";
import { TypeError } from "../../typing/type-error";
import { TypingTree } from "../../typing/typing-tree/typing-tree";
import { TypingTreeNodeLabel } from "../../typing/typing-tree/typing-tree-node-label";

/**
 * TODO: Handle in binary expression instead!
 */
export class StructAccessExpression extends AstNode {

    public struct: AstNode;
    public member: Identifier;

    constructor(codeLine: number, struct: AstNode, member: Identifier) {
        super(codeLine);
        
        this.struct = struct;
        this.member = member;
    }

    public getCode(): string {
        return this.struct.getCode() + "." + this.member.getCode();
    }

    public getGraphNodeLabel(): string {
        return ".";
    }

    public getGraph(): Graph<AstNode> {
        let structGraph = this.struct.getGraph();
        let memberGraph = this.member.getGraph();
        
        const newNode = this.getGraphNode();
        const newEdges = [
            new Edge(newNode, this.struct.getGraphNode()),
            new Edge(newNode, this.member.getGraphNode())
        ];

        return new Graph([newNode], newEdges)
        .merge(structGraph)
        .merge(memberGraph);
    }

    public performTypeCheck(t: TypeEnvironment): AbstractType_ {
        const structType = this.struct.performTypeCheck(t);
        if(structType instanceof StructType) {
            const member = structType.getMembers().find(m => m.getName() === this.member.getName());
            if(!member) return this.failTypeCheck(structType.toString() + " does not include member " + this.member.getName()); // Wildcard
            
            return this.type = member.getType(); 
        } else {
            return this.failTypeCheck("Cannot use '.' operator on type " + structType.toString()); // Wildcard
        }
    }

    public getType(): AbstractType_ {
        return this.type;
    }

    public getTypingTree(): TypingTree {
        const structTree = this.struct.getTypingTree();
        //const memberTree = this.member.getTypingTree();

        return new TypingTree(TypingTreeNodeLabel.STRUCT, this, [structTree]);
    }

}